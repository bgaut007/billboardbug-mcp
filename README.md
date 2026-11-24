# BillboardBug MCP

A local stdio MCP server for the BillboardBug API. The TypeScript implementation is built to `build/index.js` and exposes the eleven tools listed below.

Repository: https://github.com/bgaut007/billboardbug-mcp
Published bundles: https://github.com/bgaut007/billboardbug-mcp/releases
API documentation: https://east-us-api.billboardbug.com/public-api/docs/

A repository version or successful CI build is not proof that a release has been published. Use the release asset and checksum for the specific version you intend to install.

## Version 2.0.0 compatibility

- Node.js 20 or later is required by the package and bundle manifest. Release validation targets Node 20, 22 and 24.
- Local uploads are restricted to the operator-controlled `BILLBOARDBUG_MEDIA_ROOT` directory, defaulting to `./media` relative to the server working directory. Previously accepted arbitrary local paths must move into that directory or use base64.
- Local and decoded base64 media are limited to 10 MiB. Base64 must be canonical and padded; whitespace and unpadded input are rejected.
- Symlinks, traversal outside the media root, non-regular files and unsupported media extensions are rejected. Exactly one upload source is required.
- Keep the media directory private, free of secrets and unwritable by untrusted local processes. Path checks are not an OS sandbox against hostile concurrent directory replacement or same-user processes.
- Unsupported safe-file-opening platforms must use base64. Linux descriptor-path checks require `/proc/self/fd`. Local-file behavior has not been validated on Windows or macOS.
- Dependency updates include a Zod major-version change. Existing helper and mocked upload regressions do not establish exhaustive compatibility for all tool inputs or production behavior.

## Build from a reviewed checkout

On a supported shell and Node runtime, from the repository root:

```bash
npm ci --ignore-scripts --engine-strict
npm run build
mkdir -p media
export BILLBOARDBUG_API_KEY="your-key-from-app.billboardbug.com"
claude mcp add billboardbug -- node "$PWD/build/index.js"
```

Create an API key at https://app.billboardbug.com in Settings > API Keys. Keep it in the host's secret/environment configuration; never commit it or paste it into shared logs. Review your host's approval settings before enabling tools that create or update content.

The repository `.mcp.json` and bundle manifest use `build/index.js`. Build before launching from a clone. `mcp/server.mjs` is a separate legacy implementation; it is not the maintained upload implementation.

## Tools

| Tool | Purpose |
|---|---|
| `create_deal` | Create a deal from supplied business, location and media information |
| `update_deal` | Update a deal |
| `get_deal` | Read a deal back |
| `list_my_deals` | List deals associated with the API key |
| `list_categories` | Retrieve storefront categories |
| `search_deals` | Search deals |
| `upload_media` | Upload permitted local or base64 media |
| `generate_image` | Request image generation |
| `create_chirp` | Create a chirp |
| `update_chirp` | Update a chirp |
| `get_chirp` | Read a chirp back |

Tool success is not independent proof of map visibility or end-to-end application health. Confirm the business's instructions, avoid invented offers, and perform read-back verification before reporting a completed action.

## Bundle validation and limits

The bundle workflow installs the committed lockfile without lifecycle scripts, audits dependencies, rebuilds, checks generated-file drift and runs helper and mocked upload tests. It packages an allowlisted manifest, package metadata, README, license, rebuilt server/helper and production dependencies. It inspects paths, sizes, selected credential signatures and ZIP integrity, then tests the extracted bundle with mocked networking.

Credential-signature heuristics are not a complete secret scan. The checks do not establish formal MCPB schema conformance, bundle signature verification, desktop-host integration, Windows/macOS behavior or production upload success. GitHub Actions artifacts and candidate receipts are not releases.

Public API response redaction, per-action authorization, API-base restrictions and broader gateway/database security remain separate review work.

## License and responsible use

MIT. Use the API responsibly and follow BillboardBug's terms.
