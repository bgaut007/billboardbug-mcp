# ruvnet products for Billboardbug

These stay upstream. This file is the Billboardbug index. Do not fork the product source into bgaut007.

Profile: https://github.com/ruvnet

## Connect

Claude and service clients:

```text
https://x.ruv.io/mcp
```

ChatGPT:

```text
https://x.ruv.io/chatgpt/mcp
```

Claude Code:

```text
/plugin marketplace add ruvnet/ruvnet
/plugin install ruvnet@ruvnet

/plugin marketplace add ruvnet/ruflo
/plugin install ruflo-core@ruflo
/plugin install ruflo-swarm@ruflo
/plugin install ruflo-rag-memory@ruflo
```

Local Ruflo MCP:

```bash
npx ruflo@latest mcp list
claude mcp add ruflo -- npx -y ruflo@latest mcp start
```

## Core products

| Product | Repo | Use with Billboardbug |
| --- | --- | --- |
| RuView | https://github.com/ruvnet/RuView | Wi-Fi presence and vitals. An agent can read presence, then place a billboard at that coordinate. |
| Ruflo | https://github.com/ruvnet/ruflo | Agent swarms and 314 MCP tools. Orchestrates the billboard create flow. |
| RuVector | https://github.com/ruvnet/RuVector | Vector and graph memory. Stores which coordinates and deals worked. |
| MetaHarness | https://github.com/ruvnet/metaharness | Harness generation and evaluation for the Billboardbug agent. |
| RVM | https://github.com/ruvnet/rvm | Capability-controlled execution. Keeps agent actions bounded. |
| RVF | used by the stack | Memory and evidence format between sessions. Not a separate Billboardbug repo. |

## Related ruv repos

| Repo | What it is |
| --- | --- |
| https://github.com/ruvnet/federated-mcp | Public federation reader for x.ruv.io |
| https://github.com/ruvnet/ruos | Agentic desktop and computer-use MCP |
| https://github.com/ruvnet/QuDAG | Quantum-resistant DAG messaging |

Cognitum cogs are a separate org: https://github.com/cognitum-one
