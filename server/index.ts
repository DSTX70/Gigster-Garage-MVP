// File: server/index.ts
// Purpose: Fix iOS Safari -1015 by ensuring correct compression/headers and add SPA history fallback for / and /mobile/*.

import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import path from "node:path";
import history from "connect-history-api-fallback";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// --- Security & base middleware ---
app.disable("x-powered-by");
app.use((req, _res, next) => {  // why: consistent UTF-8; avoid stray encodings
  req.headers["accept-charset"] = "utf-8";
  next();
});

// --- Compression disabled for iOS Safari compatibility ---
// why: iOS Safari -1015 errors are caused by compression issues
// Temporarily disable all compression to fix mobile access
// app.use(compression());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// --- Mobile user agent detection ---
function isMobileDevice(userAgent: string): boolean {
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

// --- Redirect mobile root -> /mobile (do NOT touch other paths) ---
app.use((req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers["user-agent"] || "";
  if (req.method === "GET" && req.path === "/" && isMobileDevice(userAgent)) {
    log(`📱 Redirecting mobile browser from ${req.path} to /mobile`);
    return res.redirect(302, "/mobile");
  }
  next();
});

(async () => {
  // --- Diagnostics (BEFORE other routes) ---
  app.get("/health", (_req, res) => {
    // why: quick manual check; Safari -1015 usually indicates encoding mismatch
    res.type("text/plain").send("OK");
  });

  // --- API routes (mounted BEFORE SPA fallback) ---
  const server = await registerRoutes(app);

  // --- SPA History Fallback for client routes ---
  // why: Ensure /mobile and deep links render index.html via Vite (dev) or dist (prod)
  const historyMiddleware = history({
    verbose: false,
    // preserve API, static assets, and Vite dev server requests
    rewrites: [
      { from: /^\/api\/.*$/, to: (ctx: any) => ctx.parsedUrl.path || "" },
      { from: /^\/assets\/.*$/, to: (ctx: any) => ctx.parsedUrl.path || "" },
      { from: /^\/src\/.*$/, to: (ctx: any) => ctx.parsedUrl.path || "" }, // Vite source files
      { from: /^\/node_modules\/.*$/, to: (ctx: any) => ctx.parsedUrl.path || "" }, // Vite dependencies
      { from: /^\/\@.*$/, to: (ctx: any) => ctx.parsedUrl.path || "" }, // Vite special routes (@vite/client, @fs, etc.)
      { from: /^\/health$/, to: (ctx: any) => ctx.parsedUrl.path || "" },
      { from: /.*\.(js|jsx|ts|tsx|css|json|woff|woff2|eot|ttf|otf|png|jpg|jpeg|gif|svg|ico)$/, to: (ctx: any) => ctx.parsedUrl.path || "" }, // Static file extensions
    ],
  });
  app.use(historyMiddleware);

  // --- Vite middleware (dev) + static (prod) ---
  await setupVite(app, server);
  serveStatic(app);

  // start the server
  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();

// NOTE: Remove any manual setting of 'Content-Encoding' or serving precompressed files
// unless the server sets the matching header automatically.