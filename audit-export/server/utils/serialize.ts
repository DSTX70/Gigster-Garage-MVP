/**
 * JSON-safe replacer used by Express' res.json when set via app.set('json replacer').
 * Converts BigInt and Date to strings; leaves other values unchanged.
 */
export function jsonReplacer(_key: string, value: unknown) {
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  return value as any;
}

/** JSON-safe scalar coercion. */
function toJsonScalar(v: any) {
  if (v === null || v === undefined) return null;
  if (typeof v === "bigint") return v.toString();
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "number" || typeof v === "boolean" || typeof v === "string") return v;
  // For Decimal-like objects (e.g., drizzle decimal/numeric wrappers), fallback to string
  try {
    // Uses same rules as res.json, but forces plain data
    return JSON.parse(JSON.stringify(v, jsonReplacer));
  } catch {
    return String(v);
  }
}

/**
 * Defensive: some drivers return row objects with non-enumerable props or prototypes.
 * Normalize into a plain object with own enumerable keys only, coercing scalars.
 */
export function toPlainJson<T extends Record<string, any>>(row: T) {
  const out: Record<string, any> = {};
  for (const k of Object.keys(row)) out[k] = toJsonScalar((row as any)[k]);
  return out;
}

/** Narrowed helper for invoices to keep API stable. */
export function toApiInvoice(row: Record<string, any>) {
  const plain = toPlainJson(row);
  // Ensure critical fields exist & are strings where needed
  if (plain.id != null) plain.id = String(plain.id);
  if (plain.createdAt instanceof Date) plain.createdAt = (plain.createdAt as Date).toISOString();
  if (plain.updatedAt instanceof Date) plain.updatedAt = (plain.updatedAt as Date).toISOString();
  // If you store money as numeric/decimal, ensure strings
  for (const m of ["subtotal", "taxRate", "taxAmount", "discountAmount", "totalAmount"]) {
    if (plain[m] != null && typeof plain[m] !== "string") plain[m] = String(plain[m]);
  }
  return plain;
}