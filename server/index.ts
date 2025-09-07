import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import type { Task, Project, User, Invoice } from "@shared/schema";

const app = express();

// Mobile user agent detection function
function isMobileDevice(userAgent: string): boolean {
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}

// Mobile detection and redirect middleware (but not for /mobile routes)
app.use((req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers['user-agent'] || '';
  const isMobile = isMobileDevice(userAgent);
  
  // Only redirect to /mobile if accessing root and is mobile device
  if (req.path === '/' && isMobile && !req.path.startsWith('/mobile')) {
    log(`📱 Redirecting mobile browser from ${req.path} to /mobile - UA: ${userAgent.substring(0, 100)}...`);
    return res.redirect('/mobile');
  }
  
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

(async () => {
  const server = await registerRoutes(app);
  
  // setup vite in middleware mode and register its middleware
  const vite = await setupVite(app, server);

  // Important: Static file serving should be last
  serveStatic(app);

  // start the server
  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();