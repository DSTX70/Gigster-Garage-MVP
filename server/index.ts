import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// iOS Safari mobile fallback for Error -1015 "cannot decode raw data"
app.get('/mobile', (req, res) => {
  const mobileHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gigster Garage - Mobile</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #004C6D 0%, #0B1D3A 100%);
            color: white; 
            min-height: 100vh;
            padding: 20px;
        }
        .container { max-width: 600px; margin: 0 auto; text-align: center; }
        .logo { font-size: 2rem; font-weight: bold; margin-bottom: 1rem; }
        .card { 
            background: rgba(255,255,255,0.1); 
            padding: 20px; 
            border-radius: 12px; 
            margin: 20px 0; 
        }
        .btn { 
            display: inline-block;
            background: #059669; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 10px;
            font-weight: bold;
        }
        .btn:hover { background: #047857; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚀 Gigster Garage</div>
        <div class="card">
            <h2>📱 Mobile App Loading...</h2>
            <p>If the app doesn't load automatically, try:</p>
            <a href="/" class="btn">🔄 Try Main App</a>
            <a href="/test.html" class="btn">🧪 Test Page</a>
        </div>
        <div id="status" class="card">
            <strong>⚙️ Initializing...</strong>
        </div>
    </div>
    
    <script>
        console.log('📱 Mobile fallback page loaded')
        document.getElementById('status').innerHTML = '<strong>✅ JavaScript Working!</strong><p>Mobile compatibility mode active.</p>'
        
        // Try to load the main app after 2 seconds
        setTimeout(() => {
            document.getElementById('status').innerHTML = '<strong>🔄 Loading main app...</strong>'
            window.location.href = '/'
        }, 3000)
    </script>
</body>
</html>`
  
  res.set({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  })
  res.send(mobileHTML)
});

// Detect iOS Safari and redirect to mobile fallback
app.use((req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const isIOSSafari = /iPhone|iPad|iPod/.test(userAgent) && /Safari/.test(userAgent);
  
  if (isIOSSafari && req.path === '/' && !req.query.desktop) {
    return res.redirect('/mobile');
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
