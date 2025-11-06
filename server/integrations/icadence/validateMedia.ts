import { headWithCache } from "../../lib/mediaHeadCache.js";

const MAX_MEDIA_BYTES = Number(process.env.SOCIAL_MEDIA_MAX_BYTES ?? 10 * 1024 * 1024); // 10MB default
const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export async function validateMediaUrls(urls: string[] = []): Promise<boolean> {
  for (const u of urls) {
    let parsed: URL;
    
    // Validate URL format
    try {
      parsed = new URL(u);
    } catch {
      throw new Error(`Invalid media URL: ${u}`);
    }

    // Check protocol
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      throw new Error(`Disallowed protocol in URL: ${u} (only http/https allowed)`);
    }

    // Use cached HEAD request to check size
    const head = await headWithCache(u);
    
    if (head.content_length && Number(head.content_length) > MAX_MEDIA_BYTES) {
      throw new Error(`Media file too large: ${u} (${head.content_length} bytes, max ${MAX_MEDIA_BYTES})`);
    }
    
    if (head.ok === false) {
      throw new Error(`Media HEAD failed or URL not reachable: ${u}`);
    }
  }
  
  return true;
}
