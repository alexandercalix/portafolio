using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using MongoDB.Bson;

namespace PortfolioBackend
{
    public class SubmitContactForm
    {
        private readonly ILogger _logger;
        private static MongoClient? _mongoClient;
        private static IMongoDatabase? _database;
        private static IMongoCollection<BsonDocument>? _collection;

        public SubmitContactForm(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<SubmitContactForm>();

        }

        [Function("SubmitContactForm")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            try
            {
                // 1. Initialize DB here so we can trap errors
                if (_mongoClient == null)
                {
                    string? connectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
                    if (string.IsNullOrEmpty(connectionString))
                    {
                        var noEnvResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                        await noEnvResponse.WriteStringAsync("DIAGNOSTIC ERROR: MONGODB_URI environment variable is totally empty or null. Azure did not inject it.");
                        return noEnvResponse;
                    }

                    _mongoClient = new MongoClient(connectionString);
                    _database = _mongoClient.GetDatabase("PortfolioDB");
                    _collection = _database.GetCollection<BsonDocument>("ContactSubmissions");
                }

                // 2. Normal execution logic
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();

                if (string.IsNullOrWhiteSpace(requestBody))
                {
                    var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                    await badRequest.WriteStringAsync("{\"error\": \"Empty request body\"}");
                    return badRequest;
                }

                var submission = BsonDocument.Parse(requestBody);
                submission.Add("SubmittedAt", DateTime.UtcNow);

                await _collection!.InsertOneAsync(submission);

                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "application/json");
                await response.WriteStringAsync("{\"message\": \"Form submitted successfully\"}");

                return response;
            }
            catch (Exception ex)
            {
                // 3. Spits the exact crash reason back to your terminal!
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                errorResponse.Headers.Add("Content-Type", "text/plain");
                await errorResponse.WriteStringAsync($"CRASH REPORT: {ex.Message} \n\nSTACK TRACE: {ex.StackTrace}");

                return errorResponse;
            }
        }
    }
}