using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;

namespace otdev.Backend.Common
{
    /// <summary>
    /// Validates Microsoft Entra ID JWT tokens for the API.
    /// Utilizes static caching for the configuration manager to optimize performance and reduce network calls.
    /// </summary>
    public static class JwtAuthValidator
    {
        private static ConfigurationManager<OpenIdConnectConfiguration>? _configurationManager;
        private static TokenValidationParameters? _baseValidationParameters;

        /// <summary>
        /// Validates the Authorization header of the incoming HTTP request.
        /// </summary>
        /// <param name="req">The incoming HTTP request data.</param>
        /// <returns>True if the token is valid, false otherwise.</returns>
        public static async Task<bool> ValidateRequestAsync(Microsoft.Azure.Functions.Worker.Http.HttpRequestData req)
        {
            if (!req.Headers.TryGetValues("Authorization", out var authHeaders))
                return false;

            var token = authHeaders.FirstOrDefault()?.Split(" ").Last();
            if (string.IsNullOrEmpty(token))
                return false;

            // Initialize the OpenID Configuration Manager once per cold start.
            if (_configurationManager == null)
            {
                var tenantId = Environment.GetEnvironmentVariable("ENTRA_TENANT_ID");
                var clientId = Environment.GetEnvironmentVariable("ENTRA_CLIENT_ID");
                var issuer = $"https://login.microsoftonline.com/{tenantId}/v2.0";

                _configurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                    $"{issuer}/.well-known/openid-configuration",
                    new OpenIdConnectConfigurationRetriever());

                _baseValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuers = new[] 
                    { 
                        $"https://login.microsoftonline.com/{tenantId}/v2.0",
                        $"https://sts.windows.net/{tenantId}/" 
                    },
                    ValidateAudience = true,
                    ValidAudiences = new[] 
                    { 
                        clientId, 
                        $"api://{clientId}" 
                    },
                    ValidateLifetime = true
                };
            }

            try
            {
                // Fetch the OpenID configuration (cached internally by the ConfigurationManager).
                var openIdConfig = await _configurationManager.GetConfigurationAsync();
                
                // Clone the base validation parameters and attach the current signing keys.
                var validationParameters = _baseValidationParameters!.Clone();
                validationParameters.IssuerSigningKeys = openIdConfig.SigningKeys;

                var handler = new JwtSecurityTokenHandler();
                handler.ValidateToken(token, validationParameters, out _);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}