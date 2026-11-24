import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { basename, isAbsolute, relative, resolve, sep } from "node:path";
export const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
export const MAX_BASE64_CHARS = 4 * Math.ceil(MAX_MEDIA_BYTES / 3);
function contained(root, path) {
    const rel = relative(root, path);
    return rel !== "" && !isAbsolute(rel) && rel !== ".." && !rel.startsWith(`..${sep}`);
}
// The operator must keep this directory private and not writable by untrusted
// local processes. These portable checks do not provide an openat-style sandbox
// against concurrent hostile replacement of ancestor directories.
export async function readMediaFile(filePath, mediaRoot) {
    const root = await realpath(mediaRoot);
    if (!(await lstat(root)).isDirectory())
        throw new Error("Invalid media directory");
    const target = resolve(root, filePath);
    if (!contained(root, target))
        throw new Error("Media path is outside the permitted directory");
    let cursor = root;
    for (const component of relative(root, target).split(sep)) {
        cursor = resolve(cursor, component);
        if ((await lstat(cursor)).isSymbolicLink())
            throw new Error("Media symlinks are not allowed");
    }
    const canonical = await realpath(target);
    if (!contained(root, canonical))
        throw new Error("Media path is outside the permitted directory");
    const before = await lstat(canonical);
    if (!before.isFile() || before.size > MAX_MEDIA_BYTES)
        throw new Error("Media must be a regular file of at most 10 MiB");
    if (typeof constants.O_NOFOLLOW !== "number" || typeof constants.O_NONBLOCK !== "number") {
        throw new Error("Safe local media opening is unsupported on this platform; use base64 instead");
    }
    const handle = await open(canonical, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    try {
        const opened = await handle.stat();
        if (!opened.isFile() || opened.size > MAX_MEDIA_BYTES || opened.dev !== before.dev || opened.ino !== before.ino) {
            throw new Error("Media file changed or is not permitted");
        }
        if (process.platform === "linux") {
            const openedPath = await realpath(`/proc/self/fd/${handle.fd}`);
            if (!contained(root, openedPath))
                throw new Error("Opened media is outside the permitted directory");
        }
        const chunks = [];
        let total = 0;
        for (;;) {
            const buffer = Buffer.alloc(Math.min(64 * 1024, MAX_MEDIA_BYTES + 1 - total));
            const { bytesRead } = await handle.read(buffer, 0, buffer.length, null);
            if (bytesRead === 0)
                break;
            total += bytesRead;
            if (total > MAX_MEDIA_BYTES)
                throw new Error("Media exceeds 10 MiB");
            chunks.push(buffer.subarray(0, bytesRead));
        }
        return { bytes: Buffer.concat(chunks, total), name: basename(canonical) };
    }
    finally {
        await handle.close();
    }
}
export function decodeMediaBase64(input, fileName = "upload.jpg") {
    if (input.length > MAX_BASE64_CHARS + 256)
        throw new Error("Encoded media is too large");
    let encoded = input;
    if (input.startsWith("data:")) {
        const comma = input.indexOf(",");
        if (comma < 0 || comma > 255 || !/^data:[a-z0-9.+-]+\/[a-z0-9.+-]+;base64$/i.test(input.slice(0, comma))) {
            throw new Error("Invalid base64 data URI");
        }
        encoded = input.slice(comma + 1);
    }
    if (!encoded || encoded.length > MAX_BASE64_CHARS || encoded.length % 4 !== 0 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) {
        throw new Error("Invalid or oversized base64 media");
    }
    const padding = encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0;
    if (encoded.length / 4 * 3 - padding > MAX_MEDIA_BYTES)
        throw new Error("Media exceeds 10 MiB");
    const bytes = Buffer.from(encoded, "base64");
    if (bytes.toString("base64") !== encoded)
        throw new Error("Non-canonical base64 media");
    const name = basename(fileName.replace(/\\/g, "/"));
    if (!name || name === "." || name === ".." || /[\x00-\x1f\x7f]/.test(name))
        throw new Error("Invalid media file name");
    return { bytes, name };
}
