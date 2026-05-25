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
using System.Threading.Tasks;

namespace otdev.AzFunctionApp
{
    public class ProfileEndpoints
    {
        private readonly IProfileService _mongoService;
        private readonly IR2Service _r2Service;

        public ProfileEndpoints(IProfileService mongoService, IR2Service r2Service)
        {
            _mongoService = mongoService;
            _r2Service = r2Service;
        }

        [Function("GetProfile")]
        public async Task<HttpResponseData> GetProfile([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "profile")] HttpRequestData req)
        {
            var profile = await _mongoService.GetProfileAsync();
            var response = req.CreateResponse(profile == null ? HttpStatusCode.NotFound : HttpStatusCode.OK);
            if (profile != null)
            {
                profile.Experiences = profile.Experiences.OrderBy(x => x.SortOrder).ToList();
                profile.Educations = profile.Educations.OrderBy(x => x.SortOrder).ToList();
                await response.WriteAsJsonAsync(profile);
            }
            return response;
        }

        [Function("UpdateProfile")]
        public async Task<HttpResponseData> UpdateProfile([HttpTrigger(AuthorizationLevel.Anonymous, "put", "options", Route = "profile")] HttpRequestData req)
        {
            if (req.Method.ToLower() == "options") return req.CreateResponse(HttpStatusCode.NoContent);

            if (!await JwtAuthValidator.ValidateRequestAsync(req)) return req.CreateResponse(HttpStatusCode.Unauthorized);

            var parsedForm = await MultipartFormDataParser.ParseAsync(req.Body);
            var dataJson = parsedForm.GetParameterValue("data");
            var requestData = JsonSerializer.Deserialize<UpdateProfileRequest>(dataJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (requestData == null) return req.CreateResponse(HttpStatusCode.BadRequest);

            var profile = await _mongoService.GetProfileAsync() ?? new SiteProfile();

            profile.Name = requestData.Name;
            profile.Headline = requestData.Headline;
            profile.Bio = requestData.Bio;
            profile.AuthorTitle = requestData.AuthorTitle;
            profile.AuthorBio = requestData.AuthorBio;
            profile.CurrentFocus = requestData.CurrentFocus;
            profile.SystemCapabilities = requestData.SystemCapabilities;
            profile.GithubUrl = requestData.GithubUrl;
            profile.LinkedInUrl = requestData.LinkedInUrl;
            profile.Experiences = requestData.Experiences;
            profile.Educations = requestData.Educations;
            profile.UpdatedAt = DateTime.UtcNow;

            // Handle Avatar
            var avatarFile = parsedForm.Files.FirstOrDefault(f => f.Name == "avatar");
            if (avatarFile != null)
            {
                if (!string.IsNullOrWhiteSpace(profile.AvatarUrl))
                {
                    try { await _r2Service.DeleteImageAsync(profile.AvatarUrl); } catch { /* Ignore */ }
                }
                profile.AvatarUrl = await _r2Service.UploadImageAsync(avatarFile.Data, avatarFile.FileName, avatarFile.ContentType);
            }

            // Handle Resume
            var resumeFile = parsedForm.Files.FirstOrDefault(f => f.Name == "resume");
            if (resumeFile != null)
            {
                if (!string.IsNullOrWhiteSpace(profile.ResumeUrl))
                {
                    try { await _r2Service.DeleteImageAsync(profile.ResumeUrl); } catch { /* Ignore */ }
                }
                profile.ResumeUrl = await _r2Service.UploadImageAsync(resumeFile.Data, resumeFile.FileName, resumeFile.ContentType);
            }

            await _mongoService.UpsertProfileAsync(profile);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(profile);
            return response;
        }
    }
}
