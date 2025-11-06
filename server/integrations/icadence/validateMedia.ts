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

    // HEAD request to check size
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(u, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const len = res.headers.get("content-length");
      if (len && Number(len) > MAX_MEDIA_BYTES) {
        throw new Error(`Media file too large: ${u} (${len} bytes, max ${MAX_MEDIA_BYTES})`);
      }
    } catch (e: any) {
      // Allow if HEAD isn't supported, but log warning
      if (e.name === 'AbortError') {
        console.warn("[media-preflight] Timeout checking", u);
      } else if (!e.message.includes('too large')) {
        console.warn("[media-preflight] HEAD failed for", u, e.message);
      } else {
        throw e; // Re-throw size errors
      }
    }
  }
  
  return true;
}
