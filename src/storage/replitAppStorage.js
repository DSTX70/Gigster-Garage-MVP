// Minimal fs-based provider for Replit App Storage (PRIVATE_OBJECT_DIR)
import { createWriteStream, createReadStream, promises as fsp } from "node:fs";
import { mkdir, stat, rm } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import { pipeline } from "node:stream/promises";

function assertEnv() {
  const root = process.env.PRIVATE_OBJECT_DIR;
  if (!root) throw new Error("PRIVATE_OBJECT_DIR is required for Replit App Storage.");
  return root;
}

function safeKey(key) {
  const clean = normalize(key).replace(/^(\.\.(\/|\\|$))+/, "");
  if (clean.startsWith("..")) throw new Error("Invalid objectKey");
  return clean;
}

export class ReplitAppStorageProvider {
  constructor(rootDir = assertEnv()) {
    this.root = rootDir;
  }

  fullPath(key) {
    return join(this.root, safeKey(key));
  }

  async put(key, data, { contentType, overwrite } = {}) {
    const target = this.fullPath(key);
    await mkdir(dirname(target), { recursive: true });
    try {
      if (Buffer.isBuffer(data)) {
        await fsp.writeFile(target, data, { flag: overwrite ? "w" : "wx" });
      } else {
        const ws = createWriteStream(target, { flags: overwrite ? "w" : "wx" });
        await pipeline(data, ws);
      }
    } catch (err) {
      if (err?.code === "EEXIST" && !overwrite) {
        throw new Error(`Object already exists: ${key}`);
      }
      throw err;
    }
    // No metadata store; caller tracks contentType elsewhere if needed.
    return target;
  }

  async get(key) {
    const target = this.fullPath(key);
    const s = await stat(target);
    return { stream: createReadStream(target), contentType: undefined, size: s.size };
  }

  async exists(key) {
    try {
      await stat(this.fullPath(key));
      return true;
    } catch {
      return false;
    }
  }

  async delete(key) {
    await rm(this.fullPath(key), { force: true });
  }
}