using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using System;
using System.Net;
using System.Threading.Tasks;

namespace PortfolioBackend
{
    public class HealthEndpoints
    {
        [Function("GetHealth")]
        public async Task<HttpResponseData> GetHealth(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "options","head", Route = "health")] HttpRequestData req)
        {
            if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
            {
                return req.CreateResponse(HttpStatusCode.NoContent);
            }

            var response = req.CreateResponse(HttpStatusCode.OK);

            await response.WriteAsJsonAsync(new
            {
                status = "healthy",
                systemTime = DateTime.UtcNow.ToString("O")
            });

            return response;
        }
    }
}