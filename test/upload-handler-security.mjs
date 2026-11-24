import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const server = fileURLToPath(new URL('../build/index.js', import.meta.url));
const preload = fileURLToPath(new URL('./mock-upload-fetch.cjs', import.meta.url));

async function fetchCount(trace) {
  try { return (await readFile(trace, 'utf8')).trim().split('\n').filter(Boolean).length; }
  catch (error) { if (error.code === 'ENOENT') return 0; throw error; }
}

// The child replaces fetch before loading the server and never delegates to it.
// No production credentials, API requests, or publication commands are used.
test('upload handler blocks rejected inputs before fetch and routes valid uploads to a mock', { timeout: 30000, skip: process.platform === 'win32' }, async () => {
  const dir = await mkdtemp(join(tmpdir(), 'bbb-handler-'));
  const root = join(dir, 'media');
  const trace = join(dir, 'fetch.jsonl');
  const client = new Client({ name: 'offline-upload-regression', version: '1' });
  try {
    await mkdir(root);
    await writeFile(join(root, 'safe.png'), 'safe');
    await writeFile(join(dir, 'private.txt'), 'private');
    await symlink(join(dir, 'private.txt'), join(root, 'escape.png'));
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ['--require', preload, server],
      env: {
        BILLBOARDBUG_API_KEY: 'offline-test-only',
        BILLBOARDBUG_API_BASE: 'https://offline.invalid',
        BILLBOARDBUG_MEDIA_ROOT: root,
        BILLBOARDBUG_TEST_TRACE: trace,
      },
    });
    await client.connect(transport);
    const rejected = [
      {},
      { filePath: 'safe.png', base64Data: 'c2FmZQ==' },
      { base64Data: '!!!!' },
      { base64Data: 'c2FmZQ==', fileName: 'unsafe.txt' },
      { filePath: '../private.txt' },
      { filePath: 'escape.png' },
      { filePath: '.' },
    ];
    for (const input of rejected) {
      const before = await fetchCount(trace);
      const result = await client.callTool({ name: 'upload_media', arguments: { category: 'post-image', ...input } });
      assert.equal(result.isError, true, `Input should be refused: ${JSON.stringify(input)}`);
      assert.equal(await fetchCount(trace), before, 'A rejected upload must not invoke fetch');
    }
    for (const input of [{ filePath: 'safe.png' }, { base64Data: 'c2FmZQ==', fileName: 'safe.png' }]) {
      const before = await fetchCount(trace);
      const result = await client.callTool({ name: 'upload_media', arguments: { category: 'post-image', ...input } });
      assert.notEqual(result.isError, true);
      assert.equal(JSON.parse(result.content[0].text).id, 'offline-media-fixture');
      assert.equal(await fetchCount(trace), before + 1);
    }
  } finally {
    try { await client.close(); } finally { await rm(dir, { recursive: true, force: true }); }
  }
});
