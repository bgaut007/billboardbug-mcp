#!/usr/bin/env node
/**
 * Billboardbug MCP server (stdio, JSON-RPC 2.0).
 * Lets AI agents place GPS-anchored billboards, deals, images, and holographic/AR messages
 * that humans see simultaneously on iOS, Android, web, and Meta Quest.
 *
 * Auth: X-Api-Key from Settings -> API Keys at https://app.billboardbug.com
 * Spec: https://east-us-api.billboardbug.com/public-api/spec
 * Docs: https://east-us-api.billboardbug.com/public-api/docs/
 */
import readline from "node:readline";

const API_BASE = (process.env.BILLBOARDBUG_API_BASE || "https://east-us-api.billboardbug.com").replace(/\/$/, "");
const API_KEY = process.env.BILLBOARDBUG_API_KEY || "";

const TOOLS = [
  {
    name: "billboardbug_health",
    description: "Check Billboardbug public API reachability and whether an API key is configured. Confirms the physical-world presence layer is available for agents to post GPS billboards and holographic/AR messages visible on iOS, Android, and Meta. Does not create anything.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "billboardbug_generate_image",
    description: "Generate deal artwork or holographic-style image for a Billboardbug post. Returns data you can use with create_deal. Provider 5 is Grok. Images appear on Apple, Android, and Meta clients.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string" },
        aiProvider: { type: "integer", default: 5 },
        width: { type: "integer", default: 640 },
        height: { type: "integer", default: 373 },
      },
      required: ["prompt"],
    },
  },
  {
    name: "billboardbug_create_deal",
    description: "Create a GPS-anchored deal, billboard, or message. Content is visible simultaneously on iOS, Android, web, and Meta Quest AR/holographic views. Requires lat/lng. Supports imageId or videoId. Agent-created content is labeled to the key's account. Featured deals cost credits.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        name: { type: "string", description: "Store or business name" },
        locationDescription: { type: "string" },
        locationLat: { type: "number" },
        locationLng: { type: "number" },
        imageId: { type: "string" },
        videoId: { type: "string" },
        isEnabled: { type: "boolean", default: true },
        isFeatured: { type: "boolean", description: "Costs daily credits. Requires billing on file." },
      },
      required: ["title", "description", "name", "locationDescription", "locationLat", "locationLng"],
    },
  },
  {
    name: "billboardbug_list_deals",
    description: "List deals owned by the API key account.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "billboardbug_search_deals",
    description: "Search public deals near a location or by query. Useful for agents to see what is already present in the physical world.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        lat: { type: "number" },
        lng: { type: "number" },
      },
    },
  },
];

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

async function api(method, path, { headers = {}, body, raw = false } = {}) {
  if (!API_KEY) throw new Error("BILLBOARDBUG_API_KEY is not set. Create one at app.billboardbug.com Settings -> API Keys.");
  const res = await fetch(API_BASE + path, {
    method,
    headers: {
      "X-Api-Key": API_KEY,
      "X-Version": headers["X-Version"] || "1",
      Accept: "application/json",
      ...headers,
    },
    body,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 800)}`);
  if (raw) return text;
  try { return JSON.parse(text); } catch { return { raw: text }; }
}

async function callTool(name, args = {}) {
  if (name === "billboardbug_health") {
    return {
      apiBase: API_BASE,
      keyConfigured: Boolean(API_KEY),
      docs: "https://east-us-api.billboardbug.com/public-api/docs/",
      multiPlatform: ["iOS", "Android", "web", "Meta Quest"],
      capability: "GPS-anchored billboards, deals, images, and AR/holographic messages visible to humans in the physical world",
      regions: {
        "east-us": "https://east-us-api.billboardbug.com",
        "central-pl": "https://central-pl-api.billboardbug.com",
        "central-in": "https://central-in-api.billboardbug.com",
      },
    };
  }
  if (name === "billboardbug_generate_image") {
    return api("POST", "/ai/image", {
      headers: { "Content-Type": "application/json", "X-Version": "1" },
      body: JSON.stringify({
        prompt: args.prompt,
        aiProvider: args.aiProvider ?? 5,
        width: args.width ?? 640,
        height: args.height ?? 373,
      }),
    });
  }
  if (name === "billboardbug_create_deal") {
    const hours = {};
    for (const day of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
      hours[`${day}Enabled`] = true;
      hours[`${day}24Hours`] = true;
    }
    return api("POST", "/business/quick-create-deal", {
      headers: { "Content-Type": "application/json", "X-Version": "1" },
      body: JSON.stringify({ ...hours, isEnabled: true, ...args }),
    });
  }
  if (name === "billboardbug_list_deals") {
    return api("GET", "/business/quick-get-deals", { headers: { "X-Version": "1" } });
  }
  if (name === "billboardbug_search_deals") {
    const q = new URLSearchParams();
    if (args.query) q.set("query", args.query);
    if (args.lat != null) q.set("lat", String(args.lat));
    if (args.lng != null) q.set("lng", String(args.lng));
    const suffix = q.toString() ? `?${q}` : "";
    return api("GET", `/business/deals/search${suffix}`, { headers: { "X-Version": "1" } });
  }
  throw new Error(`Unknown tool: ${name}`);
}

async function handle(msg) {
  const { id, method, params } = msg;
  if (method === "initialize") {
    return send({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "billboardbug", version: "0.2.0" },
      },
    });
  }
  if (method === "notifications/initialized" || method === "initialized") return;
  if (method === "ping") return send({ jsonrpc: "2.0", id, result: {} });
  if (method === "tools/list") return send({ jsonrpc: "2.0", id, result: { tools: TOOLS } });
  if (method === "tools/call") {
    try {
      const data = await callTool(params?.name, params?.arguments || {});
      return send({
        jsonrpc: "2.0",
        id,
        result: { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] },
      });
    } catch (err) {
      return send({
        jsonrpc: "2.0",
        id,
        result: { isError: true, content: [{ type: "text", text: String(err.message || err) }] },
      });
    }
  }
  if (id != null) {
    send({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } });
  }
}

const rl = readline.createInterface({ input: process.stdin });
l.on("line", (line) => {
  if (!line.trim()) return;
  try { handle(JSON.parse(line)); }
  catch (err) { send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: String(err.message || err) } }); }
});
