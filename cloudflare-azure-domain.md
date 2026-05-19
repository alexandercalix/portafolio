# Custom Domain Integration: Cloudflare Proxy + Azure Function App

This guide details how to safely map a custom subdomain (e.g., `api.yourdomain.com`) to an Azure Function App while routing traffic through Cloudflare for security, DDoS mitigation, and edge caching.

Because Cloudflare proxies hide backend origin servers, Azure cannot validate ownership or issue managed SSL certificates under a standard orange-cloud setup. This document outlines the explicit step-by-step verification, binding workaround, and final network verification.

---

## Prerequisites

- A domain registered on a domain registrar (e.g., Spaceship, Namecheap).
- A Cloudflare account.
- An active Azure Function App running on a serverless configuration (e.g., Flex Consumption).

---

## Step 1: Onboard the Domain to Cloudflare

1. Log into your **Cloudflare Dashboard** and click **Add a Site**.
2. Enter your apex domain (e.g., `yourdomain.com`) and choose the **Free Plan**.
3. Cloudflare will scan your existing domain setup for active mail (MX) or verification records. Confirm they are detected and click **Continue**.
4. Cloudflare will generate **two custom nameservers** (e.g., `name1.ns.cloudflare.com`). Copy these down.

---

## Step 2: Update Nameservers at the Registrar

1. Log into your domain registrar account (e.g., **Spaceship**).
2. Go to your **Domain Manager** panel and select your domain.
3. Locate the **Nameservers / DNS Settings** card.
4. Change the nameserver profile from the default setup to **Custom DNS**.
5. Paste the two Cloudflare nameservers into the fields and save your modifications.
   > ⚠️ **Note:** If your registrar warns you that native email profiles will become inactive, proceed anyway. Cloudflare already cloned those exact MX records in Step 1, so your email service will continue to operate without interruption.
6. Wait 5-15 minutes for global DNS propagation to route the domain through Cloudflare.

---

## Step 3: Initiate the Custom Domain Process in Azure

1. Log into the **Azure Portal** and navigate to your **Function App**.
2. On the **Overview / Essentials** tab, copy down your assigned **Default domain** URL (e.g., `your-app-name.azurewebsites.net`).
3. In the left-hand sidebar menu under **Settings**, select **Custom domains**.
4. At the top of the workspace, click **+ Add custom domain**.
5. In the configuration fly-out window, configure the following options:
   - **Domain provider:** Select **All other domain services**.
   - **Domain:** Type your target subdomain (e.g., `api.yourdomain.com`).
6. Look directly below at the **Domain validation** panel. Azure will display a table containing a `CNAME` rule and a `TXT` rule. Keep this window open.

---

## Step 4: Configure DNS Records in Cloudflare (The Initial Handshake)

Open your **Cloudflare Dashboard**, navigate to **DNS > Records**, and add both rules from the Azure panel.

### 1. Add the Validation Token (`TXT`)

- **Type:** `TXT`
- **Name:** `asuid.[yoursubdomain]` (e.g., type `asuid.api`).
- **TTL:** `Auto`
- **Content / Value:** Copy the exact long cryptographic token string listed under the `TXT` row value inside the Azure Portal table.
- Click **Save**.

### 2. Add the Routing Path (`CNAME`)

- **Type:** `CNAME`
- **Name:** `[yoursubdomain]` (e.g., `api`).
- **Target:** Paste your default Azure function app endpoint URL (`your-app-name.azurewebsites.net`).

> ### 🛑 CRITICAL ARCHITECTURAL STEP: DISABLE CLOUDFLARE PROXY
>
> Before hitting save on the CNAME record, look at the **Proxy status** option. Click the orange cloud toggle so it switches explicitly to **DNS Only (Gray Cloud)**.
>
> **Why this matters:** Azure must perform an unobstructed, direct network inspection of the custom DNS target line to authorize your ownership and generate its internal infrastructure linkages. If Cloudflare proxies the traffic (Orange Cloud) during this stage, Azure will only see Cloudflare's edge proxy IPs and validation will fail.
>
> _Ensure the cloud status icon is visually **GRAY** before proceeding._

- Click **Save**.

---

## Step 5: Validate and Create the TLS/SSL Certificate Binding in Azure

Once both records are safely published to Cloudflare's gray cloud, head back to the Azure Portal window to finalize validation and secure the backend routing layer.

1. At the bottom of the open **Add custom domain** Azure window, click **Validate**.
2. Both checks (**Hostname availability** and **Domain ownership**) will display green checkmarks. Click **Add** to map the domain identity.
3. The custom domain will populate into the Azure dashboard table showing an `X No Binding` alert status. Locate the **Solution** column next to it and click **Add binding**.
4. An **Add TLS/SSL binding** modal window will fly open from the right. Configure it exactly as follows:
   - **TLS/SSL type:** Ensure **SNI SSL** is selected.
   - **Source:** Select **Create App Service Managed Certificate**. _(This instructs Azure to issue an enterprise-grade SSL certificate for your subdomain completely free of charge and handle automated renewals)._
5. Click **Validate** (or **Create/Add**) at the bottom of the binding modal.
6. Azure will spend 1–2 minutes running an active validation check against your gray-cloud CNAME record, generating the private cryptographic keys, and wrapping your custom domain. The interface state will close out and update to a green checkmark reading **Secured**.

---

## Step 6: Activate Cloudflare Edge Protection (The Orange Cloud)

Now that Azure has mapped the identity and completed its security configuration checks, you can safely drop Cloudflare's security shield over your cloud compute instances.

1. Return to your **Cloudflare DNS Records** list.
2. Locate the **CNAME** record assigned to your subdomain (e.g., `api`).
3. Click **Edit**, toggle the Proxy status switch back to **Proxied (Orange Cloud)**, and hit **Save**.
4. In Cloudflare's left sidebar, navigate over to the **SSL/TLS** configuration page.
5. Set your encryption standard level to **Full (strict)**. This tells Cloudflare to enforce strict, modern transport security on the public client-side while cleanly proxying encrypted queries directly into Azure's background managed endpoints.

> ℹ️ **Note on Edge Certificate Propagation:** Upon enabling the Orange Cloud, Cloudflare may briefly show your Universal Certificate as `Pending Validation (TXT)` while processing global issuance. However, Cloudflare deploys an active `Backup Issued` certificate immediately in parallel. This fallback architecture guarantees that incoming traffic will negotiate SSL handshakes securely without waiting for the primary certificate initialization to conclude.

---

## Step 7: Post-Deployment Infrastructure Verification

To ensure your connection is structurally sound and executing properly through the proxy network, run a diagnostic request using `curl`:

```bash
curl -i [https://api.yourdomain.com/api/YourTriggerName](https://api.yourdomain.com/api/YourTriggerName)
```
