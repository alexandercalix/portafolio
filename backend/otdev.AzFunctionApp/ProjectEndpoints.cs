using HttpMultipartParser;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using otdev.Backend.Common;
using otdev.Backend.Models;
using otdev.Backend.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace otdev.AzFunctionApp
{
    /// <summary>
    /// HTTP endpoints for managing Portfolio Projects.
    /// </summary>
    public class ProjectEndpoints
    {
        private readonly IMongoService _mongoService;
        private readonly IR2Service _r2Service;

        public ProjectEndpoints(IMongoService mongoService, IR2Service r2Service)
        {
            _mongoService = mongoService;
            _r2Service = r2Service;
        }

        [Function("GetProjects")]
        public async Task<HttpResponseData> GetProjects([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "projects")] HttpRequestData req)
        {
            var query = PaginationQueryRequest.FromRequest(req);
            var result = await _mongoService.GetProjectsAsync(query, includeDrafts: false);
            
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(result);
            return response;
        }

        [Function("GetAdminProjects")]
        public async Task<HttpResponseData> GetAdminProjects([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "cms/projects")] HttpRequestData req)
        {
            if (!await JwtAuthValidator.ValidateRequestAsync(req)) return req.CreateResponse(HttpStatusCode.Unauthorized);
            var query = PaginationQueryRequest.FromRequest(req);
            var result = await _mongoService.GetProjectsAsync(query, includeDrafts: true);
            
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(result);
            return response;
        }

        [Function("GetProjectBySlug")]
        public async Task<HttpResponseData> GetProjectBySlug([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "projects/{slug}")] HttpRequestData req, string slug)
        {
            var project = await _mongoService.GetProjectBySlugAsync(slug, includeDrafts: false);
            if (project == null) return req.CreateResponse(HttpStatusCode.NotFound);
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(project);
            return response;
        }

        [Function("GetProjectById")]
        public async Task<HttpResponseData> GetProjectById([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "cms/projects/{id}")] HttpRequestData req, string id)
        {
            try {
                if (!await JwtAuthValidator.ValidateRequestAsync(req)) return req.CreateResponse(HttpStatusCode.Unauthorized);
                var project = await _mongoService.GetProjectByIdAsync(id);
                if (project == null) return req.CreateResponse(HttpStatusCode.NotFound);
                var response = req.CreateResponse(HttpStatusCode.OK);
                await response.WriteAsJsonAsync(project);
                return response;
            } catch (Exception ex) {
                var response = req.CreateResponse(HttpStatusCode.InternalServerError);
                await response.WriteStringAsync(ex.ToString());
                return response;
            }
        }

        [Function("CreateProject")]
        public async Task<HttpResponseData> CreateProject([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "projects")] HttpRequestData req)
        {
            if (!await JwtAuthValidator.ValidateRequestAsync(req)) return req.CreateResponse(HttpStatusCode.Unauthorized);

            var parsedForm = await MultipartFormDataParser.ParseAsync(req.Body);
            var projectJson = parsedForm.GetParameterValue("data");
            var requestData = JsonSerializer.Deserialize<CreateProjectRequest>(projectJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (requestData == null || string.IsNullOrWhiteSpace(requestData.Title)) return req.CreateResponse(HttpStatusCode.BadRequest);

            var project = new PortfolioProject
            {
                Title = requestData.Title,
                Description = requestData.Description,
                LiveUrl = requestData.Url,
                RepositoryUrl = requestData.GithubUrl,
                Technologies = requestData.Technologies ?? new List<string>(),
                Author = requestData.Author,
                Slug = GenerateSlug(requestData.Title),
                CreatedAt = DateTime.UtcNow,
                Images = new List<string>(),
                IsPublished = requestData.IsPublished ?? false,
                PublishedAt = (requestData.IsPublished == true) ? DateTime.UtcNow : null
            };

            // Process image uploads concurrently if any files are attached.
            if (parsedForm.Files.Any())
            {
                var uploadTasks = parsedForm.Files.Select(async file =>
                {
                    var imageUrl = await _r2Service.UploadImageAsync(file.Data, file.FileName, file.ContentType);
                    return new { file.FileName, imageUrl };
                });

                var uploadResults = await Task.WhenAll(uploadTasks);

                foreach (var result in uploadResults)
                {
                    project.Images.Add(result.imageUrl);
                    project.Description = project.Description?.Replace($"[{result.FileName}]", result.imageUrl);
                }
            }

            // Assign the first uploaded image as the thumbnail
            if (project.Images.Any())
            {
                project.ThumbnailUrl = project.Images.First();
            }
            //Auto-generate an excerpt if the user didn't provide one
            if (string.IsNullOrWhiteSpace(project.Excerpt) && !string.IsNullOrWhiteSpace(project.Description))
            {
                var cleanDesc = System.Text.RegularExpressions.Regex.Replace(project.Description, @"\[.*?\]", "");
                project.Excerpt = cleanDesc.Length > 150 
                    ? cleanDesc.Substring(0, 150).TrimEnd() + "..." 
                    : cleanDesc;
            }
            else
            {
                project.Excerpt = requestData.Excerpt;
            }

            project.CreatedAt = DateTime.UtcNow;
            await _mongoService.CreateProjectAsync(project);
            
            var response = req.CreateResponse(HttpStatusCode.Created);
            await response.WriteAsJsonAsync(project);
            return response;
        }

        [Function("UpdateProject")]
        public async Task<HttpResponseData> UpdateProject([HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "projects/{id}")] HttpRequestData req, string id)
        {
            if (!await JwtAuthValidator.ValidateRequestAsync(req)) return req.CreateResponse(HttpStatusCode.Unauthorized);

            var parsedForm = await MultipartFormDataParser.ParseAsync(req.Body);
            var projectJson = parsedForm.GetParameterValue("data");
            var requestData = JsonSerializer.Deserialize<CreateProjectRequest>(projectJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (requestData == null || string.IsNullOrWhiteSpace(requestData.Title)) return req.CreateResponse(HttpStatusCode.BadRequest);

            try { var project = await _mongoService.GetProjectByIdAsync(id); if (project == null) return req.CreateResponse(HttpStatusCode.NotFound); var response = req.CreateResponse(HttpStatusCode.OK); await response.WriteAsJsonAsync(project); return response; } catch (Exception ex) { var err = req.CreateResponse(HttpStatusCode.InternalServerError); await err.WriteStringAsync(ex.ToString()); return err; }
            if (project == null) return req.CreateResponse(HttpStatusCode.NotFound);

            project.Title = requestData.Title;
            project.Description = requestData.Description;
            project.LiveUrl = requestData.Url;
            project.RepositoryUrl = requestData.GithubUrl;
            project.Technologies = requestData.Technologies ?? new List<string>();
            project.Author = requestData.Author;
            project.Slug = GenerateSlug(requestData.Title);
            project.UpdatedAt = DateTime.UtcNow;
            project.Images ??= new List<string>();

            if (requestData.IsPublished == true && !project.IsPublished)
            {
                project.PublishedAt = DateTime.UtcNow;
            }
            project.IsPublished = requestData.IsPublished ?? false;

            // Process image uploads concurrently if any files are attached.
            if (parsedForm.Files.Any())
            {
                if (project.Images.Any())
                {
                    var deleteTasks = project.Images.Select(imgUrl => _r2Service.DeleteImageAsync(imgUrl));
                    await Task.WhenAll(deleteTasks);
                }

                project.Images.Clear();
                var uploadTasks = parsedForm.Files.Select(async file =>
                {
                    var imageUrl = await _r2Service.UploadImageAsync(file.Data, file.FileName, file.ContentType);
                    return new { file.FileName, imageUrl };
                });

                var uploadResults = await Task.WhenAll(uploadTasks);

                foreach (var result in uploadResults)
                {
                    project.Images.Add(result.imageUrl);
                    project.Description = project.Description?.Replace($"[{result.FileName}]", result.imageUrl);
                }
            }
            
            // If we have images, ensure the thumbnail is set to the first one
            if (project.Images.Any())
            {
                project.ThumbnailUrl = project.Images.First();
            }
            
            // Allow manual excerpt updates, or fallback to auto-generation
            if (!string.IsNullOrWhiteSpace(requestData.Excerpt))
            {
                project.Excerpt = requestData.Excerpt;
            }
            else if (string.IsNullOrWhiteSpace(project.Excerpt) && !string.IsNullOrWhiteSpace(project.Description))
            {
                var cleanDesc = System.Text.RegularExpressions.Regex.Replace(project.Description, @"\[.*?\]", "");
                project.Excerpt = cleanDesc.Length > 150 
                    ? cleanDesc.Substring(0, 150).TrimEnd() + "..." 
                    : cleanDesc;
            }

            await _mongoService.UpdateProjectAsync(id, project);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(project);
            return response;
        }

        [Function("DeleteProject")]
        public async Task<HttpResponseData> DeleteProject([HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "projects/{id}")] HttpRequestData req, string id)
        {
            if (!await JwtAuthValidator.ValidateRequestAsync(req)) return req.CreateResponse(HttpStatusCode.Unauthorized);
            
            var existingProject = await _mongoService.GetProjectByIdAsync(id);
            if (existingProject?.Images != null)
            {
                var deleteTasks = existingProject.Images.Select(imgUrl => _r2Service.DeleteImageAsync(imgUrl));
                await Task.WhenAll(deleteTasks);
            }

            await _mongoService.DeleteProjectAsync(id);
            return req.CreateResponse(HttpStatusCode.NoContent);
        }

        /// <summary>
        /// Generates a URL-friendly slug from a given title.
        /// </summary>
        private static string GenerateSlug(string title)
        {
            string str = title.ToLowerInvariant();
            str = Regex.Replace(str, @"[^a-z0-9\s-]", "");
            str = Regex.Replace(str, @"\s+", " ").Trim();
            str = str.Substring(0, str.Length <= 45 ? str.Length : 45).Trim();
            str = Regex.Replace(str, @"\s", "-");
            return str;
        }
    }
}