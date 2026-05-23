using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;
using System.Threading.Tasks;
using System.IO;
using System.Text.Json;
using otdev.Backend.Models;
using otdev.Backend.Services.Domains;
using otdev.Backend.Common;
using System.Text.RegularExpressions;
using System.Linq;
using Microsoft.Extensions.Logging;

namespace PortfolioBackend
{
    public class TemplateEndpoints
    {
        private readonly ITemplateService _templateService;
        private readonly IMediaService _mediaService;

        public TemplateEndpoints(ITemplateService templateService, IMediaService mediaService)
        {
            _templateService = templateService;
            _mediaService = mediaService;
        }

        [Function("GetTemplate")]
        public async Task<HttpResponseData> GetTemplate([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "templates/{id}")] HttpRequestData req, string id)
        {
            var template = await _templateService.GetTemplateAsync(id);
            if (template == null)
            {
                return req.CreateResponse(HttpStatusCode.NotFound);
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(template);
            return response;
        }

        [Function("UpdateTemplate")]
        public async Task<HttpResponseData> UpdateTemplate([HttpTrigger(AuthorizationLevel.Anonymous, "put", "options", Route = "templates/{id}")] HttpRequestData req, string id, FunctionContext executionContext)
        {
            var logger = executionContext.GetLogger("UpdateTemplate");
            
            if (req.Method.ToLower() == "options")
            {
                var optionsResponse = req.CreateResponse(HttpStatusCode.NoContent);
                return optionsResponse;
            }

            if (!await JwtAuthValidator.ValidateRequestAsync(req))
            {
                logger.LogWarning("JwtAuthValidator failed for UpdateTemplate.");
                return req.CreateResponse(HttpStatusCode.Unauthorized);
            }

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var updateData = JsonSerializer.Deserialize<EmailTemplate>(requestBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            
            if (updateData == null || string.IsNullOrWhiteSpace(updateData.MarkdownBody))
            {
                return req.CreateResponse(HttpStatusCode.BadRequest);
            }

            var template = new EmailTemplate
            {
                Id = id,
                MarkdownBody = updateData.MarkdownBody,
                UpdatedAt = System.DateTime.UtcNow
            };

            await _templateService.UpsertTemplateAsync(template);

            // Asset Lifecycle Management
            var imageUrls = Regex.Matches(template.MarkdownBody, @"!\[.*?\]\((.*?)\)")
                .Cast<Match>()
                .Select(m => m.Groups[1].Value)
                .ToList();

            // Link currently used images
            if (imageUrls.Any())
            {
                await _mediaService.UpdateMediaAssetsStatusByUrlsAsync(imageUrls, "Linked", template.Id);
            }

            // Orphan any previously linked images that are no longer in the markdown
            await _mediaService.MarkMissingMediaAsOrphanedAsync(template.Id, imageUrls);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(template);
            return response;
        }
    }
}
