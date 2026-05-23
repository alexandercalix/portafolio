using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;
using System.Threading.Tasks;
using System.IO;
using System.Text.Json;
using otdev.Backend.Models;
using otdev.Backend.Services.Domains;
using otdev.Backend.Common;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;

namespace PortfolioBackend
{
    public class SettingsApi
    {
        private readonly ISettingsService _settingsService;
        private readonly IMediaService _mediaService;

        public SettingsApi(ISettingsService settingsService, IMediaService mediaService)
        {
            _settingsService = settingsService;
            _mediaService = mediaService;
        }

        [Function("GetSettings")]
        public async Task<HttpResponseData> GetSettings([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "settings")] HttpRequestData req)
        {
            if (req.Method.ToLower() == "options") return req.CreateResponse(HttpStatusCode.NoContent);

            var settings = await _settingsService.GetSettingsAsync();
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(settings);
            return response;
        }

        [Function("UpdateSettings")]
        public async Task<HttpResponseData> UpdateSettings([HttpTrigger(AuthorizationLevel.Anonymous, "put", "options", Route = "settings")] HttpRequestData req, FunctionContext executionContext)
        {
            var logger = executionContext.GetLogger("UpdateSettings");
            
            if (req.Method.ToLower() == "options") return req.CreateResponse(HttpStatusCode.NoContent);

            if (!await JwtAuthValidator.ValidateRequestAsync(req))
            {
                logger.LogWarning("JwtAuthValidator failed for UpdateSettings.");
                return req.CreateResponse(HttpStatusCode.Unauthorized);
            }

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var updateData = JsonSerializer.Deserialize<SiteSettings>(requestBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            
            if (updateData == null)
            {
                return req.CreateResponse(HttpStatusCode.BadRequest);
            }

            var previousSettings = await _settingsService.GetSettingsAsync();
            var previousFavicon = previousSettings.FaviconUrl;

            await _settingsService.UpsertSettingsAsync(updateData);

            // Asset Lifecycle Management
            if (!string.IsNullOrEmpty(updateData.FaviconUrl))
            {
                await _mediaService.UpdateMediaAssetsStatusByUrlsAsync(new List<string> { updateData.FaviconUrl }, "Linked", "GlobalConfig");
            }

            // Orphan the old favicon if it was replaced or removed
            if (!string.IsNullOrEmpty(previousFavicon) && previousFavicon != updateData.FaviconUrl)
            {
                await _mediaService.MarkMissingMediaAsOrphanedAsync("GlobalConfig", new List<string> { updateData.FaviconUrl ?? "" });
            }

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(updateData);
            return response;
        }
    }
}
