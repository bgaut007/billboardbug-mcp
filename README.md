# Billboardbug MCP + ruvnet + Cognitum cogs

This repo exposes Billboardbug's public API as MCP tools, so an agent can place a GPS billboard, and registers the remote MCP servers for **ruvnet** and **Cognitum** (the cog programs, including the Cognitum cloud plugin).

You do not fork ruvnet or cognitum-one into this account. Those stay upstream. This repo only commits the client config and Billboardbug's own server.

Repo: https://github.com/bgaut007/billboardbug-mcp

## What gets connected

| Name | What it is | How it attaches |
| --- | --- | --- |
| billboardbug | Presence API (deals, posts, AI image) | local stdio server in `mcp/server.mjs` |
| ruvnet | Federation MCP at `https://x.ruv.io/mcp` (Claude / service clients). ChatGPT uses `https://x.ruv.io/chatgpt/mcp` | remote HTTP MCP |
| cognitum | Cognitum cloud MCP at `https://cognitum.one/mcpSse` (health, catalog, orders, fleet, docs) | remote SSE MCP |
| cogs | Cognitum Seed cog programs (100+ edge apps) | Claude marketplace, not copied into this repo |

Regions for the Billboardbug key:

- East US: `https://east-us-api.billboardbug.com` (default)
- Central Poland: `https://central-pl-api.billboardbug.com`
- Central India: `https://central-in-api.billboardbug.com`

Docs: https://east-us-api.billboardbug.com/public-api/docs/
Key: app.billboardbug.com → Settings → API Keys. Header is `X-Api-Key`.

Never commit the API key. Set it in the host environment:

```bash
export BILLBOARDBUG_API_KEY="paste-from-settings"
```

## Claude Code

From a clone of this repo:

```bash
git clone https://github.com/bgaut007/billboardbug-mcp.git
cd billboardbug-mcp
export BILLBOARDBUG_API_KEY="paste-from-settings"
claude mcp add billboardbug -- node "$PWD/mcp/server.mjs"
claude mcp add --transport http ruvnet https://x.ruv.io/mcp
claude mcp add --transport sse cognitum https://cognitum.one/mcpSse
```

Plugin marketplaces (this is how the cog programs install, without vendoring them):

```text
/plugin marketplace add ruvnet/ruvnet
/plugin install ruvnet@ruvnet

/plugin marketplace add https://cognitum.one/marketplace.json
/plugin install cognitum-mcp
/plugin install cognitum-seed
```

`cognitum-mcp` is the cloud surface (Cognitum 1 / the first platform plugin). `cognitum-seed` is the local Seed device, 100+ cog tools. Install only the cogs you want from that marketplace.

Ruflo (swarm / memory tools, optional, local):

```bash
npx ruflo@latest mcp list
claude mcp add ruvector -- npx ruvector mcp start
```

Authorize the ruvnet endpoint when the host prompts. No admin token is required for the public federation reader.

## Cursor / Claude Desktop

Merge `.mcp.json` into the host MCP config. On Desktop that file is `claude_desktop_config.json`. Replace the env placeholder with a real key only in the local file, not in git.

ChatGPT remote connector URL is `https://x.ruv.io/chatgpt/mcp`, not the Claude URL.

## What an agent can call

Billboardbug tools in `mcp/server.mjs`:

- `billboardbug_health`
- `billboardbug_generate_image` (POST `/ai/image`, provider 5 = Grok, 640×373)
- `billboardbug_create_deal` (POST `/business/quick-create-deal`)
- `billboardbug_list_deals`
- `billboardbug_search_deals`

Create flow matches the public docs: generate image → upload blob (`POST /blobs?category=billboard-image`, `X-Version: 3`) → pass `imageId` into the deal. Blob upload is still a direct API call; the MCP tool accepts an existing `imageId`.

Featured deals (`isFeatured: true`) bill daily and need a payment method. Agent-created content stays on the account that owns the key.

## If a server does not work

- ruvnet: confirm the host is using `https://x.ruv.io/mcp` and that you completed the authorize prompt. ChatGPT must use the `/chatgpt/mcp` path.
- Cognitum: SSE URL is `https://cognitum.one/mcpSse`. Fleet tools need a Cognitum device key; catalog and health do not.
- Billboardbug: `BILLBOARDBUG_API_KEY` empty is the usual failure. Key must match the region in `BILLBOARDBUG_API_BASE`.
- Cogs: they are marketplace plugins, not files in this repo. `/plugin install` after the marketplace add. A missing cog means it was not installed, not that GitHub sync failed.
