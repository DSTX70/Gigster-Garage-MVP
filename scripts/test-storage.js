// Verifies fs-based Replit storage read/write/delete roundtrip.
import { makeStorage } from "../src/storage/index.js";

async function main() {
  const storage = makeStorage();
  const orgId = "demo-org";
  const invoiceId = `inv-${Date.now()}`;
  const key = `invoices/${orgId}/${invoiceId}.pdf`;
  const payload = Buffer.from("%PDF-1.4\n%… minimal fake pdf …\n", "utf8");

  console.log("PRIVATE_OBJECT_DIR:", process.env.PRIVATE_OBJECT_DIR);
  console.log("Writing:", key);
  const loc = await storage.put(key, payload, { contentType: "application/pdf", overwrite: true });
  console.log("Location:", loc);

  const exists = await storage.exists(key);
  console.log("Exists:", exists);

  const { size } = await storage.get(key);
  console.log("Size:", size);

  await storage.delete(key);
  console.log("Deleted. Exists now:", await storage.exists(key));
}

main().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});