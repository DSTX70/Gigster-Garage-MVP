import { pool } from "../db.js";

const DEFAULT_TTL_MS = Number(process.env.MEDIA_HEAD_TTL_MS ?? 6 * 60 * 60 * 1000); // 6h

export async function headWithCache(url: string) {
  const ttl = DEFAULT_TTL_MS;
  const { rows } = await pool.query(
    `SELECT url, content_length, content_type, ok, checked_at
     FROM media_head_cache 
     WHERE url = $1`,
    [url]
  );
  const now = Date.now();

  if (rows.length) {
    const row = rows[0];
    const age = now - new Date(row.checked_at).getTime();
    if (age < ttl) return row; // fresh cache
  }

  let ok = true;
  let content_length: number | null = null;
  let content_type: string | null = null;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    content_length = Number(res.headers.get("content-length") || "0") || null;
    content_type = res.headers.get("content-type");
    ok = res.ok;
  } catch {
    ok = false;
  }

  await pool.query(
    `INSERT INTO media_head_cache (url, content_length, content_type, ok, checked_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (url) DO UPDATE 
     SET content_length = EXCLUDED.content_length,
         content_type = EXCLUDED.content_type,
         ok = EXCLUDED.ok,
         checked_at = NOW()`,
    [url, content_length, content_type, ok]
  );

  return { url, content_length, content_type, ok, checked_at: new Date().toISOString() };
}
