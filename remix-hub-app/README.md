# Remix Hub Demo — One-File Drop (Replit Ready)

**What you get**: Remix app with Tailwind **tokens**, Hub client with **mocks**, and **preflight validators**.

## Replit
1) Create Node.js Repl. Upload ZIP and extract to root (so `package.json` is top-level).
2) Add environment variables (or `.env`):
```
HUB_BASE_URL=http://localhost:8000
USE_MOCKS=true
MOCK_FALLBACK=true
```
3) Install & run:
```bash
npm ci
npm run dev
```
4) Open the app and click the button to run **/intake → /plan → /execute → /review**.
- With live Hub → calls endpoints
- No Hub → returns mocked responses

## Optional checks
```bash
node scripts/brandlock-validate.mjs
node scripts/sentinel-preflight.mjs
npm run build:checked
```
