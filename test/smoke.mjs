// Read-only smoke test: tools/list + get_deal on a known public deal. Never calls create endpoints.
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
const env = { ...process.env }; delete env.BILLBOARDBUG_API_KEY; // prove read-back works keyless
const t = new StdioClientTransport({ command: "node", args: ["build/index.js"], env });
const c = new Client({ name: "smoke", version: "0" });
await c.connect(t);
const { tools } = await c.listTools();
console.log("tools:", tools.map((x) => x.name).join(", "));
const r = await c.callTool({ name: "get_deal", arguments: {
  storefrontId: process.env.SMOKE_SF || "01a14386-bdcb-716d-9671-dc27ba48f601",
  billboardId: process.env.SMOKE_BB || "01a14386-bdcb-78a1-928f-119c717d51cf" } });
const d = JSON.parse(r.content[0].text);
console.log("get_deal:", r.isError ? "ERROR" : "OK", JSON.stringify({ title: d.title ?? d.billboard?.title, isEnabled: d.isEnabled ?? d.billboard?.isEnabled, keys: Object.keys(d).slice(0, 12) }));
if (process.env.SMOKE_KEY) {
  const cat = await (async () => { const t2 = new StdioClientTransport({ command: "node", args: ["build/index.js"], env: { ...process.env, BILLBOARDBUG_API_KEY: process.env.SMOKE_KEY } });
    const c2 = new Client({ name: "smoke2", version: "0" }); await c2.connect(t2);
    const r2 = await c2.callTool({ name: "list_categories", arguments: { nameContains: "miscellaneous", max: 3 } });
    const s2 = await c2.callTool({ name: "search_deals", arguments: { search: "howdy", limit: 3 } });
    await c2.close(); return { cat: r2.isError ? "ERROR " + r2.content[0].text.slice(0, 120) : JSON.parse(r2.content[0].text), search: s2.isError ? "ERROR " + s2.content[0].text.slice(0, 160) : "OK" }; })();
  console.log("list_categories:", JSON.stringify(cat.cat)); console.log("search_deals:", cat.search);
}
const bad = await c.callTool({ name: "create_chirp", arguments: { text: "x" } });
console.log("create without key ->", bad.isError ? "refused (expected): " + bad.content[0].text.slice(0, 80) : "UNEXPECTED");
await c.close();
