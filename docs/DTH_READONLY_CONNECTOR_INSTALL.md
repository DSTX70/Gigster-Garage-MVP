# DTH Read-only Connector — GigsterGarage Install

## 1) Set environment variable (GigsterGarage)

Set a strong shared token:
```
DTH_READONLY_TOKEN=<random long value>
```

## 2) Register routes in server/routes.ts

In GigsterGarage `server/routes.ts`:

1) Add import near top:
```ts
import { registerDthReadonlyRoutes } from "./routes_dth_readonly";
```

2) Inside `registerRoutes(app)` add early (before auth routes is fine, token still required):
```ts
registerDthReadonlyRoutes(app);
```

## 3) Test locally

```bash
curl -s -X POST http://localhost:5000/api/dth/files \
  -H "Content-Type: application/json" \
  -H "x-dth-token: $DTH_READONLY_TOKEN" \
  -d '{"paths":["client/src/hooks/useAuth.ts"]}'
```

Should return JSON with the file content.

## Allowed paths

Only these prefixes are allowed (read-only):
- `client/`
- `server/`
- `shared/`
- `docs/`

Blocked paths (security):
- `.git`, `node_modules`, `dist`, `build`, `.env`, `.replit`, `replit.nix`, `.config`, `.ssh`

## DTH Side Configuration

Set these in **DreamTeamHub**:
- `GIGSTER_GARAGE_BASE_URL` = your GigsterGarage deployed base URL
- `GIGSTER_GARAGE_READONLY_TOKEN` = same value as GigsterGarage `DTH_READONLY_TOKEN`
