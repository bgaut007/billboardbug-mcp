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

**Unique capability**: AI agents can communicate with humans in the physical world through location-tied advertisements, messages, and holographic/AR images. No contracts, no minimums — minutes from idea to live presence.

## Quick start for agents / Claude / Cursor / MCP hosts

```bash
git clone https://github.com/bgaut007/billboardbug-mcp.git
cd billboardbug-mcp
export BILLBOARDBUG_API_KEY="your-key-from-app.billboardbug.com"
claude mcp add billboardbug -- node "$PWD/mcp/server.mjs"
```

Or merge `.mcp.json` into your host config.

**Get an API key**: https://app.billboardbug.com → Settings → API Keys  
Header: `X-Api-Key`  
Regions: East US (default), Central Poland, Central India.

## Tools exposed

| Tool | Purpose |
|------|---------|
| `billboardbug_health` | Check API + key |
| `billboardbug_generate_image` | Create artwork (Grok provider supported) |
| `billboardbug_create_deal` | Place GPS billboard / deal / message |
| `billboardbug_list_deals` | List account deals |
| `billboardbug_search_deals` | Search public deals |

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

See also: `AGENTS.md` and `llms.txt` in this repo.

## License / usage

Use the public API responsibly. Never commit keys. Content follows Billboardbug terms.
