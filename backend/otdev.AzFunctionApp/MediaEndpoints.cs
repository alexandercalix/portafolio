using HttpMultipartParser;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using otdev.Backend.Common;
using otdev.Backend.Models;
using otdev.Backend.Services;
using otdev.Backend.Services.Domains;
using System.Net;
using System.Threading.Tasks;

namespace otdev.AzFunctionApp
{
    public class MediaEndpoints
    {
        private readonly IMediaService _mediaService;
        private readonly IR2Service _r2Service;

        public MediaEndpoints(IMediaService mediaService, IR2Service r2Service)
        {
            _mediaService = mediaService;
            _r2Service = r2Service;
        }

        [Function("UploadMedia")]
        public async Task<HttpResponseData> UploadMedia(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "media/upload")] HttpRequestData req)
        {
            if (!await JwtAuthValidator.ValidateRequestAsync(req))
                return req.CreateResponse(HttpStatusCode.Unauthorized);

            var parser = await MultipartFormDataParser.ParseAsync(req.Body);
            
            var file = parser.Files.Count > 0 ? parser.Files[0] : null;
            if (file == null)
            {
                var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                await badRequest.WriteStringAsync("No file provided.");
                return badRequest;
            }

            // Stream to R2
            string publicUrl = await _r2Service.UploadImageAsync(file.Data, file.FileName, file.ContentType);

            // Register in MongoDB as Orphaned
            var mediaAsset = new MediaAsset
            {
                Url = publicUrl,
                Status = "Orphaned"
            };
            
            await _mediaService.InsertMediaAssetAsync(mediaAsset);

            // Return { url: "..." }
            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new { url = publicUrl });
            return response;
        }
    }
}
