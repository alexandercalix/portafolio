using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using otdev.Backend.Models;
using System.Text.Json;
using Azure;
using Azure.Messaging.EventGrid;

namespace PortfolioBackend
{
    public class SubmitContactForm
    {
        private readonly ILogger _logger;
        private static IMongoClient? _mongoClient;
        private static IMongoDatabase? _database;
        private static IMongoCollection<ContactSubmission>? _collection;
        private static EventGridPublisherClient? _eventGridClient;

        public SubmitContactForm(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<SubmitContactForm>();
        }

        [Function("SubmitContactForm")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", "options")] HttpRequestData req)
        {
            try
            {
                Console.WriteLine("Contact Form Triggered");

                if (req.Method.ToLower() == "options")
                {
                    return req.CreateResponse(HttpStatusCode.NoContent);
                }

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
                    string databaseName = Environment.GetEnvironmentVariable("MONGO_DB_NAME") ?? "Portfolio";
                    _database = _mongoClient.GetDatabase(databaseName);
                    _collection = _database.GetCollection<ContactSubmission>("ContactSubmissions");
                }

                if (_eventGridClient == null)
                {
                    string endpoint = Environment.GetEnvironmentVariable("EVENT_GRID_ENDPOINT") ?? "";
                    string key = Environment.GetEnvironmentVariable("EVENT_GRID_KEY") ?? "";
                    if (!string.IsNullOrEmpty(endpoint) && !string.IsNullOrEmpty(key))
                    {
                        _eventGridClient = new EventGridPublisherClient(
                            new Uri(endpoint),
                            new AzureKeyCredential(key)
                        );
                    }
                }

                // 2. Normal execution logic
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();

                if (string.IsNullOrWhiteSpace(requestBody))
                {
                    var badRequest = req.CreateResponse(HttpStatusCode.BadRequest);
                    await badRequest.WriteStringAsync("{\"error\": \"Empty request body\"}");
                    return badRequest;
                }

                var submission = JsonSerializer.Deserialize<ContactSubmission>(requestBody, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (submission == null)
                {
                    return req.CreateResponse(HttpStatusCode.BadRequest);
                }
                
                submission.SubmittedAt = DateTime.UtcNow;
                submission.Status = "Unread";
                await _collection!.InsertOneAsync(submission);

                if (_eventGridClient != null)
                {
                    var eventGridEvent = new EventGridEvent(
                        subject: "ContactFormSubmitted",
                        eventType: "otdev.io.ContactForm",
                        dataVersion: "1.0",
                        data: submission
                    );
                    try 
                    {
                        await _eventGridClient.SendEventAsync(eventGridEvent);
                        _logger.LogInformation("Successfully published ContactFormSubmitted to Event Grid.");
                    }
                    catch (RequestFailedException rfe)
                    {
                        _logger.LogError(rfe, "EventGrid publisher specifically failed to send the event! Status Code: {Status}, Message: {Message}", rfe.Status, rfe.Message);
                        // We still want to return success to the user since it saved to DB, so we don't rethrow.
                    }
                    catch (Exception pubEx)
                    {
                        _logger.LogError(pubEx, "Unknown error while publishing to Event Grid.");
                    }
                }
                else
                {
                    _logger.LogWarning("Event Grid Client is not configured. Event was not published.");
                }

                var response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "application/json");
                await response.WriteStringAsync("{\"message\": \"Form submitted successfully\"}");

                Console.WriteLine("Form submitted successfully");

                return response;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"CRASH REPORT: {ex.Message} \n\nSTACK TRACE: {ex.StackTrace}");  
                // 3. Spits the exact crash reason back to your terminal!
                var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
                errorResponse.Headers.Add("Content-Type", "text/plain");
                await errorResponse.WriteStringAsync($"CRASH REPORT: {ex.Message} \n\nSTACK TRACE: {ex.StackTrace}");

                return errorResponse;
            }
        }
    }
}