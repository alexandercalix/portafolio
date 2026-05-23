using HttpMultipartParser;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using otdev.Backend.Common;
using otdev.Backend.Models;
using otdev.Backend.Services;
using otdev.Backend.Services.Domains;
using System;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using MongoDB.Bson;

namespace otdev.AzFunctionApp
{
    /// <summary>
    /// HTTP endpoints for managing Blog Posts.
    /// </summary>
    public class BlogEndpoints
    {
        private readonly IBlogService _mongoService;
        private readonly IR2Service _r2Service;
        private readonly IMediaService _mediaService;

        public BlogEndpoints(IBlogService mongoService, IR2Service r2Service, IMediaService mediaService)
        {
            _mongoService = mongoService;
            _r2Service = r2Service;
            _mediaService = mediaService;
        }

        [Function("GetBlogPosts")]
        public async Task<HttpResponseData> GetBlogPosts([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "blogs")] HttpRequestData req)
        {
            var query = PaginationQueryRequest.FromRequest(req);
            var result = await _mongoService.GetBlogPostsAsync(query, includeDrafts: false);
            
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(result);
            return response;
        }

        [Function("GetAdminBlogPosts")]
        public async Task<HttpResponseData> GetAdminBlogPosts([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "cms/blogs")] HttpRequestData req)
        {
            if (!await JwtAuthValidator.ValidateRequestAsync(req)) return req.CreateResponse(HttpStatusCode.Unauthorized);
            var query = PaginationQueryRequest.FromRequest(req);
            var result = await _mongoService.GetBlogPostsAsync(query, includeDrafts: true);
            
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(result);
            return response;
        }

        [Function("GetBlogPostBySlug")]
        public async Task<HttpResponseData> GetBlogPostBySlug([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "blogs/{slug}")] HttpRequestData req, string slug)
        {
            var post = await _mongoService.GetBlogPostBySlugAsync(slug, includeDrafts: false);
            if (post == null) return req.CreateResponse(HttpStatusCode.NotFound);
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(post);
            return response;
        }

        [Function("GetBlogPostById")]
        public async Task<HttpResponseData> GetBlogPostById([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "cms/blogs/{id}")] HttpRequestData req, string id)
        {
            try {
                if (!await JwtAuthValidator.ValidateRequestAsync(req)) return req.CreateResponse(HttpStatusCode.Unauthorized);
                var post = await _mongoService.GetBlogPostByIdAsync(id);
                if (post == null) return req.CreateResponse(HttpStatusCode.NotFound);
                var response = req.CreateResponse(HttpStatusCode.OK);
                await response.WriteAsJsonAsync(post);
                return response;
            } catch (Exception ex) {
                var response = req.CreateResponse(HttpStatusCode.InternalServerError);
                await response.WriteStringAsync(ex.ToString());
                return response;
            }
        }

        [Function("CreateBlogPost")]
        public async Task<HttpResponseData> CreateBlogPost([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "blogs")] HttpRequestData req)
        {
            if (!await JwtAuthValidator.ValidateRequestAsync(req)) return req.CreateResponse(HttpStatusCode.Unauthorized);

            var parsedForm = await MultipartFormDataParser.ParseAsync(req.Body);
            var postJson = parsedForm.GetParameterValue("data");
            var requestData = JsonSerializer.Deserialize<CreateBlogPostRequest>(postJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (requestData == null || string.IsNullOrWhiteSpace(requestData.Title)) return req.CreateResponse(HttpStatusCode.BadRequest);

            var post = new BlogPost
            {
                Id = ObjectId.GenerateNewId().ToString(),
                Title = requestData.Title,
                Content = requestData.Content,
                Excerpt = requestData.Excerpt,
                Category = requestData.Category,
                Tags = requestData.Tags ?? new List<string>(),
                Technologies = requestData.Technologies ?? new List<string>(),
                Author = requestData.Author,
                Slug = GenerateSlug(requestData.Title),
                CreatedAt = DateTime.UtcNow,
                IsPublished = requestData.IsPublished ?? false,
                PublishedAt = (requestData.IsPublished == true) ? DateTime.UtcNow : null
            };

            // Process image uploads concurrently if any files are attached.
            var uploadedImageUrls = new List<string>();
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
                    post.Content = post.Content?.Replace($"[{result.FileName}]", result.imageUrl);
                    uploadedImageUrls.Add(result.imageUrl);
                }
            }

            // Assign the first uploaded image as the thumbnail
            if (uploadedImageUrls.Any())
            {
                post.ThumbnailUrl = uploadedImageUrls.First();
            }
            
            //Auto-generate an excerpt if the user didn't provide one
            if (!string.IsNullOrWhiteSpace(requestData.Excerpt))
            {
                post.Excerpt = requestData.Excerpt;
            }
            else if (string.IsNullOrWhiteSpace(post.Excerpt) && !string.IsNullOrWhiteSpace(post.Content))
            {
                // Strip out the bracketed image tags from the excerpt text
                var cleanDesc = System.Text.RegularExpressions.Regex.Replace(post.Content, @"\[.*?\]", "");
                post.Excerpt = cleanDesc.Length > 150 
                    ? cleanDesc.Substring(0, 150).TrimEnd() + "..." 
                    : cleanDesc;
            }

            post.CreatedAt = DateTime.UtcNow;
            await _mongoService.CreateBlogPostAsync(post);
            
            var imageUrls = Regex.Matches(post.Content ?? "", @"!\[.*?\]\((.*?)\)")
                .Cast<Match>()
                .Select(m => m.Groups[1].Value)
                .ToList();

            if (imageUrls.Any() && post.Id != null)
            {
                await _mediaService.UpdateMediaAssetsStatusByUrlsAsync(imageUrls, "Linked", post.Id);
            }
            
            var response = req.CreateResponse(HttpStatusCode.Created);
            await response.WriteAsJsonAsync(post);
            return response;
        }

        [Function("UpdateBlogPost")]
        public async Task<HttpResponseData> UpdateBlogPost([HttpTrigger(AuthorizationLevel.Anonymous, "put", Route = "blogs/{id}")] HttpRequestData req, string id)
        {
            if (!await JwtAuthValidator.ValidateRequestAsync(req)) return req.CreateResponse(HttpStatusCode.Unauthorized);

            var parsedForm = await MultipartFormDataParser.ParseAsync(req.Body);
            var postJson = parsedForm.GetParameterValue("data");
            var requestData = JsonSerializer.Deserialize<CreateBlogPostRequest>(postJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (requestData == null || string.IsNullOrWhiteSpace(requestData.Title)) return req.CreateResponse(HttpStatusCode.BadRequest);

            var post = await _mongoService.GetBlogPostByIdAsync(id);
            if (post == null) return req.CreateResponse(HttpStatusCode.NotFound);

            post.Title = requestData.Title;
            post.Content = requestData.Content;
            post.Excerpt = requestData.Excerpt;
            post.Category = requestData.Category;
            post.Tags = requestData.Tags ?? new List<string>();
            post.Technologies = requestData.Technologies ?? new List<string>();
            post.Author = requestData.Author;
            post.Slug = GenerateSlug(requestData.Title);
            post.UpdatedAt = DateTime.UtcNow;

            if (requestData.IsPublished == true && !post.IsPublished)
            {
                post.PublishedAt = DateTime.UtcNow;
            }
            post.IsPublished = requestData.IsPublished ?? false;

            // Process image uploads concurrently if any files are attached.
            var uploadedImageUrls = new List<string>();
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
                    post.Content = post.Content?.Replace($"[{result.FileName}]", result.imageUrl);
                    uploadedImageUrls.Add(result.imageUrl);
                }
            }

            // If we have images, ensure the thumbnail is set to the first one
            if (uploadedImageUrls.Any() && string.IsNullOrWhiteSpace(post.ThumbnailUrl))
            {
                post.ThumbnailUrl = uploadedImageUrls.First();
            }
            
            // Allow manual excerpt updates, or fallback to auto-generation
            if (!string.IsNullOrWhiteSpace(requestData.Excerpt))
            {
                post.Excerpt = requestData.Excerpt;
            }
            else if (string.IsNullOrWhiteSpace(post.Excerpt) && !string.IsNullOrWhiteSpace(post.Content))
            {
                var cleanDesc = System.Text.RegularExpressions.Regex.Replace(post.Content, @"\[.*?\]", "");
                post.Excerpt = cleanDesc.Length > 150 
                    ? cleanDesc.Substring(0, 150).TrimEnd() + "..." 
                    : cleanDesc;
            }

            await _mongoService.UpdateBlogPostAsync(id, post);

            var imageUrls = Regex.Matches(post.Content ?? "", @"!\[.*?\]\((.*?)\)")
                .Cast<Match>()
                .Select(m => m.Groups[1].Value)
                .ToList();

            if (post.Id != null)
            {
                await _mediaService.UpdateMediaAssetsStatusByUrlsAsync(imageUrls, "Linked", post.Id);
                await _mediaService.MarkMissingMediaAsOrphanedAsync(post.Id, imageUrls);
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(post);
            return response;
        }

        [Function("DeleteBlogPost")]
        public async Task<HttpResponseData> DeleteBlogPost([HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "blogs/{id}")] HttpRequestData req, string id)
        {
            if (!await JwtAuthValidator.ValidateRequestAsync(req)) return req.CreateResponse(HttpStatusCode.Unauthorized);
            await _mongoService.DeleteBlogPostAsync(id);
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