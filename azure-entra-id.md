
# Microsoft Entra ID & Backend Security Guide

This guide explains how to set up Microsoft Entra ID (formerly Azure AD) as a Single-Tenant identity provider to secure backend API endpoints, including the critical configuration steps required to test via Postman and prevent token mismatch errors.

## Overview

By creating a Single-Tenant application, you restrict access strictly to users within your specific Microsoft directory (e.g., just the administrator). This eliminates the need to build a custom username/password system or manage database credentials.

**Crucial Architecture Note:** In this flow, the **Client** (Next.js or Postman) requires the Client Secret to prove its identity and request a token. The **Backend API** (Azure Functions) *does not* need the Client Secret; it only uses the public Tenant and Client IDs to cryptographically verify the token it receives.

---

## Step 1: Register the Application

1. Log into the **Azure Portal**.
2. Navigate to **Microsoft Entra ID** > **App registrations**.
3. Click **+ New registration**.
4. **Name:** Provide a descriptive name (e.g., `admin-auth-app`).
5. **Supported account types:** Select **Accounts in this organizational directory only (Single tenant)**.
6. **Redirect URI:** Select **Web** and add your callback URLs.
* *For local testing with Postman:* `https://oauth.pstmn.io/v1/callback`
* *For frontend auth:* `http://localhost:3000/api/auth/callback/azure-ad`


7. Click **Register**.

## Step 2: Generate the Client Secret (The Password)

1. On the app's overview page, go to **Certificates & secrets** > **Client secrets**.
2. Click **+ New client secret**.
3. Add a description and set the expiration to the maximum allowed (730 days).
4. **CRITICAL TRAP:** Copy the string in the **Value** column immediately. Do *not* copy the "Secret ID". If you send the Secret ID during authentication, Entra ID will return an `invalid_client` error.

## Step 3: Expose the API & Create Scopes (Preventing `invalid_resource`)

By default, Entra ID does not know your application is acting as a backend API. If you request a token without explicitly exposing the API, you will receive an `invalid_resource` error.

1. On the left menu, click **Expose an API**.
2. Next to **Application ID URI**, click **Add** (or **Set**). Leave the default value (`api://[your-client-id]`) and click **Save**.
3. Under **Scopes defined by this API**, click **+ Add a scope**.
4. Create an explicit access scope:
* **Scope name:** `API.Access`
* **Who can consent?** Admins and users
* **Display names/descriptions:** "Access the Backend API"
* **State:** Enabled


5. When configuring Postman or Next.js to request a token, your required scope is now explicitly: `api://[your-client-id]/API.Access`.

## Step 4: Gather Required IDs

Return to the application's **Overview** page and copy the following IDs into your backend `local.settings.json`:

* **Application (client) ID** -> `ENTRA_CLIENT_ID`
* **Directory (tenant) ID** -> `ENTRA_TENANT_ID`

*(Note: Do not confuse the two. Sending the Client ID to the Tenant ID endpoint will result in a "Tenant not found" error).*

---

## Backend Implementation Logic & The "V1 vs V2" Trap

In serverless environments, the HTTP trigger is set to `Anonymous` to allow the request to reach your code so you can manually validate the JSON Web Token (JWT).

### The Token Version Trap

Even when requesting a token from Microsoft's `v2.0` endpoint, Entra ID frequently issues legacy `v1.0` tokens under the hood.

* A v2 token uses the issuer: `https://login.microsoftonline.com/[Tenant-ID]/v2.0`
* A v1 token uses the issuer: `https://sts.windows.net/[Tenant-ID]/`

Furthermore, because we exposed the API, the token's "Audience" might be stamped as `[Client-ID]` *or* `api://[Client-ID]`.

If your backend strictly checks for only one format, valid tokens will be rejected with a `401 Unauthorized`.

### The Bulletproof Validation Setup

Your token validation parameters (e.g., in a C# `JwtSecurityTokenHandler`) must be configured to accept both sets of issuers and audiences:

```csharp
var validationParameters = new TokenValidationParameters
{
    ValidateIssuer = true,
    // Accept both v1 and v2 Microsoft Issuers
    ValidIssuers = new[] 
    { 
        $"https://login.microsoftonline.com/{tenantId}/v2.0",
        $"https://sts.windows.net/{tenantId}/" 
    },
    
    ValidateAudience = true,
    // Accept both the raw Client ID and the API URI format
    ValidAudiences = new[] 
    { 
        clientId, 
        $"api://{clientId}" 
    },
    
    ValidateLifetime = true,
    IssuerSigningKeys = openIdConfig.SigningKeys
};

```

1. The frontend sends a request with an `Authorization: Bearer <token>` header.
2. The backend code intercepts this header and fetches Microsoft's official public keys for your Tenant ID.
3. It mathematically verifies the token's signature against the flexible Issuer and Audience parameters defined above.
4. If valid, the operation proceeds. If invalid, it returns `401 Unauthorized`.