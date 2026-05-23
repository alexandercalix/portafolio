using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using otdev.Backend.Models;

namespace PortfolioBackend
{
    public class EmailDispatcher
    {
        private readonly ILogger _logger;
        private static readonly HttpClient _httpClient = new HttpClient();

        public EmailDispatcher(ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<EmailDispatcher>();
        }

        [Function("EmailDispatcher")]
        public async Task Run([EventGridTrigger] object eventGridEventStr)
        {
            _logger.LogInformation("EmailDispatcher triggered by EventGrid.");

            try
            {
                // The EventGrid trigger in isolated worker often passes the event as a JSON string/JObject.
                // We'll deserialize it into a generic JsonDocument to extract the 'data' field.
                using var jsonDoc = JsonDocument.Parse(eventGridEventStr.ToString()!);
                var root = jsonDoc.RootElement;

                if (!root.TryGetProperty("data", out var dataElement))
                {
                    _logger.LogWarning("EventGridEvent does not contain a 'data' property.");
                    return;
                }

                var submission = JsonSerializer.Deserialize<ContactSubmission>(dataElement.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (submission == null)
                {
                    _logger.LogError("Failed to deserialize ContactSubmission from EventGrid data.");
                    return;
                }

                _logger.LogInformation($"Processing email dispatch for submission from: {submission.Email}");

                string resendKey = Environment.GetEnvironmentVariable("RESEND_KEY") ?? "";
                string adminEmail = Environment.GetEnvironmentVariable("RESEND_ADMIN_EMAIL") ?? "";

                if (string.IsNullOrEmpty(resendKey) || string.IsNullOrEmpty(adminEmail))
                {
                    _logger.LogError("RESEND_KEY or RESEND_ADMIN_EMAIL environment variables are missing.");
                    return;
                }

                // Prepare Authorization
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", resendKey);

                // Payload 1: Admin Alert
                var adminPayload = new
                {
                    from = "System <oscar@otdev.io>",
                    to = new[] { adminEmail },
                    reply_to = submission.Email,
                    subject = $"[New Transmission] otdev.io Contact Form",
                    html = $@"
                        <h3>New Contact Form Submission</h3>
                        <p><strong>Name:</strong> {submission.Name}</p>
                        <p><strong>Email:</strong> {submission.Email}</p>
                        <p><strong>Subject:</strong> {submission.Subject}</p>
                        <hr />
                        <p><strong>Message:</strong></p>
                        <p>{submission.Message.Replace("\n", "<br/>")}</p>
                    "
                };

                // Payload 2: Client Auto-Reply
                var clientPayload = new
                {
                    from = "Oscar Calix <oscar@otdev.io>",
                    to = new[] { submission.Email },
                    subject = "Message Received - Oscar Calix",
                    html = $@"
                        <p>Hi {submission.Name},</p>
                        <p>This is an automated confirmation that your message regarding '{submission.Subject}' has been successfully received by my system. I will review your transmission and reach out to you shortly.</p>
                        <p>Best regards,<br/>Oscar Calix<br/>System Architect | otdev.io</p>
                    "
                };

                var adminContent = new StringContent(JsonSerializer.Serialize(adminPayload), Encoding.UTF8, "application/json");
                var clientContent = new StringContent(JsonSerializer.Serialize(clientPayload), Encoding.UTF8, "application/json");

                _logger.LogInformation("Dispatching requests to Resend API concurrently...");

                // Execute both POST requests concurrently
                var adminTask = _httpClient.PostAsync("https://api.resend.com/emails", adminContent);
                var clientTask = _httpClient.PostAsync("https://api.resend.com/emails", clientContent);

                var responses = await Task.WhenAll(adminTask, clientTask);

                var adminResponse = responses[0];
                var clientResponse = responses[1];

                if (!adminResponse.IsSuccessStatusCode)
                {
                    string err = await adminResponse.Content.ReadAsStringAsync();
                    _logger.LogError($"Admin Email failed to send. Status: {adminResponse.StatusCode}, Error: {err}");
                }
                else
                {
                    _logger.LogInformation("Admin Email successfully dispatched.");
                }

                if (!clientResponse.IsSuccessStatusCode)
                {
                    string err = await clientResponse.Content.ReadAsStringAsync();
                    _logger.LogError($"Client Email failed to send. Status: {clientResponse.StatusCode}, Error: {err}");
                }
                else
                {
                    _logger.LogInformation("Client Email successfully dispatched.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Critical error in EmailDispatcher: {ex.Message}\n{ex.StackTrace}");
                throw; // Rethrowing allows EventGrid to retry the delivery if configured
            }
        }
    }
}
