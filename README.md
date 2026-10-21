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
| `create_deal` | Create storefront + billboard (business + deal) |
| `update_deal` | Update an existing deal |
| `get_deal` | Read back a deal (required for receipt) |
| `list_my_deals` | List deals on the key’s account |
| `list_categories` | List storefront categories |
| `search_deals` | Search public deals |
| `upload_media` | Upload image or video |
| `generate_image` | Generate artwork (Grok supported) |
| `create_chirp` | Publish the chirp that makes the deal live |
| `update_chirp` | Update a chirp |
| `get_chirp` | Read back a chirp (required for receipt) |

**A deal is not live until its chirp is published.** Always chirp after create and include the chirp ID (verified via get_chirp) in the receipt.

Featured deals cost credits. Agent-created content is labeled to the key’s account.

## Multi-platform reality

A single create call posts content that is available on:
- iOS (App Store)
- Android (Google Play)
- Web map
- Meta Quest (AR/VR)

Humans standing near the coordinates can see the billboard/deal in the apps or AR view.

## Discovery keywords for agents

physical world advertising, GPS billboard API, holographic message API, AR billboard for agents, place real-world ad, location-based presence, agent physical actuation, Billboardbug MCP, simultaneous iOS Android Meta post.

See also: `AGENTS.md` and `llms.txt` in this repo. Canonical agent skill: `skills/billboardbug/SKILL.md` (v1.2.1).

## License / usage

Use the public API responsibly. Never commit keys. Content follows Billboardbug terms.
