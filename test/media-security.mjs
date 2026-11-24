import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, symlink, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readMediaFile, decodeMediaBase64, MAX_BASE64_CHARS } from "../build/media.js";

// Run after npm run build: node --test test/media-security.mjs
// Local temporary fixtures only. No network requests or credentials required.
test("media path boundaries", { skip: process.platform === "win32" }, async () => {
  const dir = await mkdtemp(join(tmpdir(), "bbb-media-"));
  try {
    const root = join(dir, "media");
    const outside = join(dir, "outside");
    await mkdir(root);
    await mkdir(outside);
    await writeFile(join(root, "safe.png"), "safe");
    await writeFile(join(outside, "private.txt"), "private");
    assert.equal((await readMediaFile("safe.png", root)).bytes.toString(), "safe");
    await assert.rejects(readMediaFile("../outside/private.txt", root));
    await assert.rejects(readMediaFile(join(outside, "private.txt"), root));
    await assert.rejects(readMediaFile(".", root));
    await symlink(join(outside, "private.txt"), join(root, "escape.png"));
    await assert.rejects(readMediaFile("escape.png", root));
    await symlink(outside, join(root, "linked-dir"));
    await assert.rejects(readMediaFile("linked-dir/private.txt", root));
    await symlink(join(root, "safe.png"), join(root, "alias.png"));
    await assert.rejects(readMediaFile("alias.png", root));
    await writeFile(join(root, "large.png"), Buffer.alloc(10 * 1024 * 1024 + 1));
    await assert.rejects(readMediaFile("large.png", root));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("base64 validation, size bounds and filename sanitization", () => {
  assert.equal(decodeMediaBase64("c2FmZQ==").bytes.toString(), "safe");
  assert.equal(decodeMediaBase64("data:image/png;base64,c2FmZQ==").bytes.toString(), "safe");
  assert.equal(decodeMediaBase64("c2FmZQ==", "../../safe.png").name, "safe.png");
  assert.equal(decodeMediaBase64("c2FmZQ==", "..\\safe.png").name, "safe.png");
  for (const value of ["", "!!!!", "c2FmZQ", "c2FmZQ==\n", "data:text/plain,hello", "Zh=="]) {
    assert.throws(() => decodeMediaBase64(value));
  }
  assert.throws(() => decodeMediaBase64("A".repeat(MAX_BASE64_CHARS + 4)));
  assert.throws(() => decodeMediaBase64("c2FmZQ==", "bad\u0000.png"));
});
