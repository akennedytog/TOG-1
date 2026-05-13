# Canva API Research Report

**Research Date:** March 2026  
**Researcher:** Dev (Engineering Agent)

---

## Executive Summary

**Yes, Canva has a public API** — it's called the **Canva Connect API**. However, it has significant limitations regarding who can access it and what it can do. The API is designed for Enterprise-level integrations and does NOT provide full programmatic design creation like some other graphic APIs.

---

## 1. Does Canva Have a Public API?

**YES** — Canva offers the **Canva Connect API**, a REST API that allows developers to integrate Canva capabilities into external applications.

Additionally, Canva offers:
- **Apps SDK** — For building apps that run *inside* the Canva editor
- **SCIM API** — For user account provisioning (Enterprise)
- **Audit Logs API** — For tracking team changes

---

## 2. What Can the Canva Connect API Do?

### ✅ Available Capabilities

| Feature | Description |
|---------|-------------|
| **Asset Management** | Upload, retrieve, update, and delete assets (images, videos) |
| **Design Metadata** | List designs, get design info, search designs |
| **Comments** | Create, read, and reply to design comments (preview) |
| **Autofill** | Generate personalized designs using Brand Templates + data |
| **Brand Templates** | List and query brand templates (Enterprise only) |
| **Export/Import** | Export designs, import from external sources |
| **Resize** | Resize designs to new dimensions/formats |
| **Folder Management** | List folders, manage design organization |
| **Bulk Create** | Generate multiple designs from data (via Brand Templates) |

### ❌ What the API CANNOT Do

| Limitation | Details |
|------------|---------|
| **Create designs from scratch** | You cannot programmatically create a design with specific elements, shapes, text placement, etc. |
| **Modify design content directly** | No API to add shapes, text boxes, or elements to existing designs |
| **Access regular Canva templates** | Only works with Brand Templates (Enterprise feature) |
| **Full design automation** | Must use Brand Templates as a starting point |

### Key Concept: Brand Templates

The primary way to "generate" designs via API is using **Brand Templates** + **Autofill**:
1. Create a design in Canva
2. Mark it as a Brand Template
3. Define data fields (text, images, charts)
4. Use API to autofill those fields with data
5. Result: A new design with populated data

---

## 3. How to Get API Access

### Step-by-Step Setup

1. **Create a Canva Account** — Sign up at canva.com
2. **Enable MFA** — Multi-factor authentication is **required**
3. **Visit Developer Portal** — Go to canva.com/developers
4. **Create an Integration**:
   - Click "Create an integration"
   - Choose **Public** (for all users, requires review) or **Private** (Enterprise teams only)
   - Agree to Developer Terms
5. **Configure Integration**:
   - Set integration name
   - Note your **Client ID**
   - Generate and save your **Client Secret** (shown once)
6. **Set Scopes** — Select required permissions:
   - `asset:read`, `asset:write` — Asset management
   - `design:meta:read`, `design:content:read/write` — Design access
   - `brandtemplate:meta:read`, `brandtemplate:content:read` — Brand Templates
   - `comment:read`, `comment:write` — Comments
7. **Add Redirect URLs** — At least one OAuth callback URL
8. **Implement OAuth 2.0** — PKCE flow for authentication

### OpenAPI Spec

Canva provides a full OpenAPI spec at:
```
https://www.canva.dev/sources/connect/api/latest/api.yml
```

You can use tools like `openapi-generator` or `openapi-ts` to generate client SDKs.

---

## 4. Access Requirements

### Prerequisites

| Requirement | Details |
|-------------|---------|
| **Canva Account** | Any Canva account works |
| **Multi-Factor Authentication** | **Required** for all integrations |
| **Developer Portal Access** | Free to register |

### Enterprise Requirements for Advanced Features

| Feature | Requirement |
|---------|-------------|
| **Brand Templates API** | Canva Enterprise subscription |
| **Autofill API** | Canva Enterprise subscription |
| **Private Integrations** | Canva Enterprise subscription |
| **Public Integrations** | Canva Enterprise NOT required |

### Development Access (Without Enterprise)

If you don't have Enterprise but have a genuine development use case:
- You can **request access** when setting up your integration
- Must explain which data source you want to connect
- Approval typically takes a few days
- Access granted for **development purposes only**
- Any user of your integration must have Canva Enterprise

---

## 5. Open-Source Tools & Wrappers

### Official Resources

| Resource | Link | Description |
|----------|------|-------------|
| **Connect API Starter Kit** | [GitHub: canva-sdks/canva-connect-api-starter-kit](https://github.com/canva-sdks/canva-connect-api-starter-kit) | Official example app with demos |
| **Apps SDK Starter Kit** | [GitHub: canva-sdks/canva-apps-sdk-starter-kit](https://github.com/canva-sdks/canva-apps-sdk-starter-kit) | For building in-editor apps |
| **OpenAPI Spec** | canva.dev/sources/connect/api/latest/api.yml | Generate your own SDK |
| **Canva Dev MCP Server** | Official | AI assistant integration |

### Third-Party Libraries

**Limited ecosystem** — Most GitHub results for "canva api" are actually for:
- HTML5 Canvas API (unrelated)
- Canvas LMS API (learning management system, unrelated)
- Personal scraping/automation scripts (unofficial, fragile)

**No widely-adopted unofficial wrappers** were found.

---

## 6. Code Examples

### OAuth Token Generation

```javascript
// Generate code_verifier and code_challenge
import crypto from "crypto";

const codeVerifier = crypto.randomBytes(96).toString("base64url");
const codeChallenge = crypto
  .createHash("sha256")
  .update(codeVerifier)
  .digest("base64url");
const state = crypto.randomBytes(96).toString("base64url");
```

### Authorization URL

```
https://www.canva.com/api/oauth/authorize?
  code_challenge={CODE_CHALLENGE}&
  code_challenge_method=s256&
  scope=asset:read%20asset:write%20design:meta:read&
  response_type=code&
  client_id={CLIENT_ID}&
  state={STATE}&
  redirect_uri={REDIRECT_URI}
```

### Get Brand Template Dataset

```bash
curl --request GET \
  --url https://api.canva.com/rest/v1/brand-templates/{TEMPLATE_ID}/dataset \
  --header 'Authorization: Bearer {TOKEN}'
```

### Create Autofill Job

```bash
curl --request POST \
  --url https://api.canva.com/rest/v1/autofills \
  --header 'Authorization: Bearer {TOKEN}' \
  --header 'Content-Type: application/json' \
  --data '{
    "brand_template_id": "{TEMPLATE_ID}",
    "data": {
      "CITY": {
        "type": "text",
        "text": "Sydney"
      },
      "BACKGROUND": {
        "type": "image",
        "asset_id": "{ASSET_ID}"
      }
    }
  }'
```

### Poll for Job Result

```bash
curl --request GET \
  --url https://api.canva.com/rest/v1/autofills/{JOB_ID} \
  --header 'Authorization: Bearer {TOKEN}'
```

---

## 7. Rate Limits

| Endpoint Type | Limit |
|---------------|-------|
| Asset operations | 30-100 requests per client user |
| Design operations | 30-100 requests per client user |
| Comment operations | 20 requests per client user |
| Brand Template operations | 60-100 requests per client user |

---

## 8. Alternatives if Canva API Isn't Suitable

### For Full Programmatic Design Creation:

| Alternative | Description |
|-------------|-------------|
| **HTML/CSS + Puppetter/Playwright** | Generate designs in browser, screenshot to image/PDF |
| **ImageMagick / Sharp** | Programmatic image manipulation |
| **SVG + Node.js** | Create vector graphics programmatically |
| **Figma REST API** | Read designs, limited write capabilities |
| **Figma Plugin API** | Full programmatic control (requires plugin) |
| **Adobe Creative SDK** | Limited availability, mostly deprecated |
| **Cloudinary / Imgix** | Dynamic image generation and manipulation |
| **Bannerbear / APITemplate.io** | Template-based image generation APIs |
| **Placid / DynaPictures** | Automated image generation from templates |

### Comparison: Canva vs Alternatives

| Feature | Canva API | Bannerbear | Placid | HTML/CSS |
|---------|-----------|------------|--------|----------|
| Template-based | ✅ Brand Templates | ✅ | ✅ | ✅ |
| Create from scratch | ❌ | ❌ | ❌ | ✅ |
| Full design control | ❌ | Limited | Limited | ✅ |
| Enterprise requirement | For advanced features | No | No | No |
| Cost | Enterprise $$$ | Paid tiers | Paid tiers | Free |

---

## 9. Realistic Assessment

### ✅ Use Canva API When:
- You have **Canva Enterprise** and want to automate Brand Template workflows
- You want to **sync assets** between Canva and another platform
- You need to **manage comments** programmatically
- You want to **export designs** automatically
- You're building an **integration** that works within the Canva ecosystem

### ❌ Don't Use Canva API When:
- You need to **create designs from scratch** programmatically
- You want **full control** over design elements
- You're looking for a **free/low-cost** design automation solution
- You don't have **Enterprise access** and need Brand Templates

### Bottom Line

The Canva Connect API is **powerful for Enterprise workflows** but **not a general-purpose design generation API**. If you need to create designs programmatically from scratch, consider HTML/CSS rendering or specialized template APIs like Bannerbear instead.

---

## References

- [Canva Developers Portal](https://www.canva.com/developers/)
- [Canva Connect API Documentation](https://www.canva.dev/docs/connect/)
- [Connect API Starter Kit](https://github.com/canva-sdks/canva-connect-api-starter-kit)
- [Apps SDK Documentation](https://www.canva.dev/docs/apps/)
- [OpenAPI Specification](https://www.canva.dev/sources/connect/api/latest/api.yml)
- [Canva Developer Community](https://community.canva.dev/)

---

*End of Report*
