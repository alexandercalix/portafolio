using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using otdev.Backend.Common;
using otdev.Backend.Models;
using otdev.Backend.Services;
using otdev.Backend.Services.Domains;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

namespace otdev.AzFunctionApp
{
    public class ContactMessageEndpoints
    {
        private readonly ILogger _logger;
        private readonly IContactMessageService _mongoService;

        public ContactMessageEndpoints(ILoggerFactory loggerFactory, IContactMessageService mongoService)
        {
            _logger = loggerFactory.CreateLogger<ContactMessageEndpoints>();
            _mongoService = mongoService;
        }

        [Function("GetContactMessages")]
        public async Task<HttpResponseData> GetContactMessages([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "cms/messages")] HttpRequestData req)
        {
            if (!await JwtAuthValidator.ValidateRequestAsync(req)) return req.CreateResponse(HttpStatusCode.Unauthorized);

            var query = PaginationQueryRequest.FromRequest(req);
            
            // Extract the optional "status" query param manually since PaginationQueryRequest doesn't natively map arbitrary fields
            var queryDictionary = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            string? status = queryDictionary["status"];

            var result = await _mongoService.GetContactMessagesAsync(query, status);

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(result);
            return response;
        }

        [Function("UpdateMessageStatus")]
        public async Task<HttpResponseData> UpdateMessageStatus([HttpTrigger(AuthorizationLevel.Anonymous, "patch", Route = "cms/messages/{id}/status")] HttpRequestData req, string id)
        {
            if (!await JwtAuthValidator.ValidateRequestAsync(req)) return req.CreateResponse(HttpStatusCode.Unauthorized);

            string requestBody = await new System.IO.StreamReader(req.Body).ReadToEndAsync();
            if (string.IsNullOrWhiteSpace(requestBody)) return req.CreateResponse(HttpStatusCode.BadRequest);

            try
            {
                var updateRequest = JsonSerializer.Deserialize<JsonElement>(requestBody);
                if (updateRequest.TryGetProperty("status", out var statusElement))
                {
                    string status = statusElement.GetString() ?? "Unread";
                    await _mongoService.UpdateContactMessageStatusAsync(id, status);
                    
                    var response = req.CreateResponse(HttpStatusCode.OK);
                    await response.WriteStringAsync("{\"message\":\"Status updated successfully\"}");
                    return response;
                }
                
                return req.CreateResponse(HttpStatusCode.BadRequest);
            }
            catch
            {
                return req.CreateResponse(HttpStatusCode.BadRequest);
            }
        }

        [Function("DeleteContactMessage")]
        public async Task<HttpResponseData> DeleteContactMessage([HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "cms/messages/{id}")] HttpRequestData req, string id)
        {
            if (!await JwtAuthValidator.ValidateRequestAsync(req)) return req.CreateResponse(HttpStatusCode.Unauthorized);

            await _mongoService.DeleteContactMessageAsync(id);

            var response = req.CreateResponse(HttpStatusCode.NoContent);
            return response;
        }
    }
}
