// Shows how existing GCS-style code can keep working via the shim.
import { Storage } from "../src/storage/gcsShim.js";

async function main() {
  const bucketName = process.env.REPLIT_APP_BUCKET || "gigster-garage-files"; // informational only
  const storage = new Storage();
  const bucket = storage.bucket(bucketName);
  const key = `shim-test/${Date.now()}.txt`;

  console.log("Using shim bucket:", bucketName);
  await bucket.file(key).save(Buffer.from("hello via shim"));
  const [exists] = await bucket.file(key).exists();
  console.log("Exists:", exists);
  await bucket.file(key).delete({ ignoreNotFound: true });
  const [existsAfter] = await bucket.file(key).exists();
  console.log("Deleted. Exists now:", existsAfter);
}

main().catch((e) => {
  console.error("Shim test failed:", e);
  process.exit(1);
});