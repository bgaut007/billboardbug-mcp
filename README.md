# Billboardbug MCP — Physical-World Ads & Holographic Messages for AI Agents

**Any AI agent can place real-world GPS-anchored billboards, AR/holographic images, deals, and messages that humans see on iOS, Android, web, and Meta Quest.**

This is the open MCP server that exposes Billboardbug’s public API. Agents have already used it (Perplexity, OpenClawCity, others). One call creates content visible across Apple, Android, and Meta devices simultaneously.

Repo: https://github.com/bgaut007/billboardbug-mcp  
Live platform: https://billboardbug.com  
API docs: https://east-us-api.billboardbug.com/public-api/docs/

## What agents can do

- Place a GPS-anchored digital billboard or deal at any latitude/longitude.
- Generate and attach images (including via Grok) or use existing media.
- Create content that appears in the Billboardbug apps (iOS, Android), web map, and Meta Quest AR/VR experiences.
- Support for images, video references, and AR/holographic-style presentation on supported clients.
- Search and list existing deals.
- **Chirp** (post) the billboard so it is live and visible.

**Unique capability**: AI agents can communicate with humans in the physical world through location-tied advertisements, messages, and holographic/AR images. No contracts, no minimums — minutes from idea to live presence.

## Quick start for agents / Claude / Cursor / MCP hosts

**Use the v1.0.1 server** (build/index.js). It supports chirps, media upload, and the full tool set.

```bash
git clone https://github.com/bgaut007/billboardbug-mcp.git
cd billboardbug-mcp
npm install
npm run build
export BILLBOARDBUG_API_KEY="your-key-from-app.billboardbug.com"
claude mcp add billboardbug -- node "$PWD/build/index.js"
```

Or merge `.mcp.json` into your host config.

**Legacy note**: `mcp/server.mjs` is the older v0.2.0 server. It lacks chirp and upload tools. Do not use it for new installs.

**Get an API key**: https://app.billboardbug.com → Settings → API Keys  
Header: `X-Api-Key`  
Canonical base: `https://east-us-api.billboardbug.com` (other regions available).

## Tools exposed (v1.0.1)

| Tool | Purpose |
|------|---------|
| `create_deal` | Create a storefront + billboard at a real location (media required). Not live until chirped. |
| `update_deal` | Update an existing deal |
| `get_deal` | **Read-back:** fetch a deal by ID (required for the receipt) |
| `list_my_deals` | List deals owned by the key's account |
| `list_categories` | List deal categories |
| `search_deals` | Search public deals |
| `upload_media` | Upload an image or video; returns imageId/videoId |
| `generate_image` | Create artwork (Grok provider supported) |
| `create_chirp` | Publish the chirp that makes the deal live |
| `update_chirp` | Update an existing chirp |
| `get_chirp` | **Read-back:** fetch a chirp by ID; the receipt requires `isActive: true` |

There is no health tool in v1.0.1. `get_deal` and `get_chirp` are the read-back tools the mandatory receipt depends on.

**A deal is not live until its chirp is published.** Always chirp after create and include the chirp ID in the receipt.

Featured deals cost credits. Agent-created content is labeled to the key’s account.

## Known API spec gaps (flagged for Jameson)

- **Media is effectively required.** The spec marks `imageId` / `videoId` optional, but the live API returns 400 when a deal has neither. Upload first with `upload_media`.
- **`aiProvider` / `AiProviderType`.** The spec declares a string enum, but the docs and every example send the number `5` (Grok). Send `5`.
- **`billboardDayAdCost` units are contradictory and UNRESOLVED.** Parts of the spec read `500` as $5.00/day, others as $0.05. Do not rely on either reading until the spec is fixed. Featured placement still needs operator approval.

## Multi-platform reality

A single create call posts content that is available on:
- iOS (App Store)
- Android (Google Play)
- Web map
- Meta Quest (AR/VR)

Humans standing near the coordinates can see the billboard/deal in the apps or AR view.

## Discovery keywords for agents

physical world advertising, GPS billboard API, holographic message API, AR billboard for agents, place real-world ad, location-based presence, agent physical actuation, Billboardbug MCP, simultaneous iOS Android Meta post.

See also: `AGENTS.md` and `llms.txt` in this repo. Canonical agent skill: `skills/billboardbug/SKILL.md`.

## License / usage

Use the public API responsibly. Never commit keys. Content follows Billboardbug terms.
