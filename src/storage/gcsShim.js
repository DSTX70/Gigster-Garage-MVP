// Compatibility shim: mimics a tiny subset of @google-cloud/storage but writes to Replit App Storage.
// Use when you want minimal app changes: swap imports to this module when USE_REPLIT_SHIM=true.
import { ReplitAppStorageProvider } from "./replitAppStorage.js";
import { PassThrough } from "node:stream";

class ShimFile {
  constructor(provider, key) {
    this.provider = provider;
    this.key = key;
  }

  async save(data, { contentType } = {}) {
    await this.provider.put(this.key, data, { contentType, overwrite: true });
  }

  createWriteStream({ contentType } = {}) {
    const pt = new PassThrough();
    // Background write; errors bubble via 'error'
    this.provider.put(this.key, pt, { contentType, overwrite: true }).catch((e) => pt.emit("error", e));
    return pt;
  }

  async getMetadata() {
    const { size } = await this.provider.get(this.key);
    return [{ contentType: undefined, size }];
  }

  createReadStream() {
    return (async () => (await this.provider.get(this.key)).stream)();
  }

  async exists() {
    return [await this.provider.exists(this.key)];
  }

  async delete({ ignoreNotFound } = {}) {
    try {
      await this.provider.delete(this.key);
    } catch (e) {
      if (!ignoreNotFound) throw e;
    }
  }

  publicUrl() {
    // Since we're using filesystem storage, return a simple path reference
    return `/storage/${this.key}`;
  }
}

class ShimBucket {
  constructor(provider, name) {
    this.provider = provider;
    this.name = name;
  }
  file(key) {
    return new ShimFile(this.provider, key);
  }
}

export class Storage {
  constructor() {
    this.provider = new ReplitAppStorageProvider();
  }
  bucket(name) {
    // Note: Replit bucket name isn't used by the filesystem; kept for API shape.
    return new ShimBucket(this.provider, name);
  }
}