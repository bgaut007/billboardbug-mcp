const { appendFileSync } = require('node:fs');
const assert = require('node:assert/strict');
globalThis.fetch = async (input, init = {}) => {
  const url = new URL(String(input));
  appendFileSync(process.env.BILLBOARDBUG_TEST_TRACE, JSON.stringify({ method: init.method, path: url.pathname }) + '\n');
  assert.equal(url.origin, 'https://offline.invalid');
  assert.equal(url.pathname, '/blobs');
  assert.equal(init.method, 'POST');
  const headers = new Headers(init.headers);
  assert.equal(headers.get('X-Api-Key'), 'offline-test-only');
  assert.equal(headers.get('X-Version'), '3');
  assert(init.body instanceof FormData);
  assert(init.body.get('file'));
  return new Response(JSON.stringify({ id: 'offline-media-fixture' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
