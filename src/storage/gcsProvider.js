// Real GCS provider (ONLY when you actually have a GCS bucket & creds)
export class GCSStorageProvider {
  constructor() {
    if (process.env.USE_GCS !== "true") {
      throw new Error("GCSStorageProvider requires USE_GCS=true");
    }
    this.bucketName = process.env.GCS_BUCKET || "";
    if (!this.bucketName) throw new Error("GCS_BUCKET is required");
    // Lazy import to avoid installing when unused
    const { Storage } = require("@google-cloud/storage");
    this.gcs = new Storage();
  }

  fileRef(key) {
    return this.gcs.bucket(this.bucketName).file(key);
  }

  async put(key, data, { contentType, overwrite } = {}) {
    const file = this.fileRef(key);
    const [exists] = await file.exists();
    if (exists && !overwrite) throw new Error(`Object already exists: ${key}`);
    if (Buffer.isBuffer(data)) {
      await file.save(data, { contentType });
    } else {
      await new Promise((res, rej) => {
        const ws = file.createWriteStream({ contentType });
        data.pipe(ws).on("finish", res).on("error", rej);
      });
    }
    return `gs://${this.bucketName}/${key}`;
  }

  async get(key) {
    const file = this.fileRef(key);
    const [meta] = await file.getMetadata();
    return { stream: file.createReadStream(), contentType: meta.contentType, size: Number(meta.size) };
  }

  async exists(key) {
    const file = this.fileRef(key);
    return (await file.exists())[0];
  }

  async delete(key) {
    await this.fileRef(key).delete({ ignoreNotFound: true });
  }
}