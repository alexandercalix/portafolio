using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System.Net;
using System.Threading.Tasks;
using System;

namespace PortfolioBackend
{
    public class HealthEndpoints
    {
        [Function("GetHealth")]
        public async Task<HttpResponseData> GetHealth([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "health")] HttpRequestData req)
        {
            if (req.Method.ToLower() == "options") return req.CreateResponse(HttpStatusCode.NoContent);

            var response = req.CreateResponse(HttpStatusCode.OK);
            var healthData = new 
            {
                status = "healthy",
                systemTime = DateTime.UtcNow.ToString("O")
            };
            
            await response.WriteAsJsonAsync(healthData);
            return response;
        }
    }
}
