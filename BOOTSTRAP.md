# Day-1 Bootstrapping Checklist

Complete guide for getting the Gigster Garage social queue system operational.

## Phase 0 — Bootstrapping

### ✅ 0.1 Wire the GitHub Board + Workflow

**Action Required by Owner:**

1. Edit `.github/workflows/auto-project-add.yml` lines 33-34:
   ```yaml
   ORG: your-actual-org-name      # Replace with your GitHub org
   PROJECT_NUMBER: 1               # Replace with your project number
   ```

2. Commit and push:
   ```bash
   git add .github/workflows/auto-project-add.yml
   git commit -m "chore(ci): auto-project add wired to org/project"
   git push
   ```

3. Self-test:
   - GitHub → Actions → "Auto Project Add + Triage"
   - Click "Run workflow" (workflow_dispatch)
   - Use defaults
   - **Confirm**: Synthetic issue created → triaged → auto-closed

---

### ✅ 0.2 Create / Import Issues

**Option A: JSON via CLI** (Recommended)
```bash
chmod +x ops/github/import_issues.sh
./ops/github/import_issues.sh ops/github/issues.json
```

**Option B: Web Upload**
- GitHub → Issues → Import
- Upload `ops/github/issues.csv`

**Optional: Auto-add to Project**
```bash
chmod +x ops/github/project_auto_add.sh
ops/github/project_auto_add.sh ops/github/issues.csv
```

---

### ✅ 0.3 DB + Environment Foundation

**Database Migrations Applied:**
- ✅ `social_rate_limits` table created
- ✅ `social_rl_usage` table created  
- ✅ `social_rl_overrides` table created
- ✅ `media_head_cache` table created
- ✅ `platform_credentials` table created
- ✅ Default rate limits initialized

**Required Environment Variables:**

Add these to your `.env` file and Replit Secrets:

```bash
# X/Twitter (OAuth 1.0a)
X_API_KEY=your_twitter_api_key
X_API_SECRET=your_twitter_api_secret
# User-specific tokens stored in DB via platform_credentials table

# Instagram (OAuth 2.0)
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
# User access tokens stored in DB

# LinkedIn (OAuth 2.0)
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
# User access tokens stored in DB

# Worker Configuration
CONCURRENCY=4                        # Number of concurrent workers (optional)
SOCIAL_MEDIA_MAX_BYTES=10485760     # Max media size: 10MB
SOCIAL_WORKER_POLL_MS=5000          # Worker polling interval: 5s
MEDIA_HEAD_TTL_MS=21600000          # Media cache TTL: 6 hours
```

---

### ✅ 0.4 Mount Pending Routes

**Status: COMPLETE** ✅

All routes mounted in `server/routes.ts`:
- ✅ `/api/ops/social-queue` - Social queue operations
- ✅ `/api/ops/rate-limits` - Rate limit management
- ✅ `/api/platform-credentials` - OAuth credential management
- ✅ `/api/loyalty` - Loyalty rewards
- ✅ Integration routes via `mountIntegrationRoutes()`

---

### 0.5 Bring Up Services

**Start the application:**
```bash
npm run dev
```

The workflow "Start application" automatically runs this command and includes both API and worker.

**Sanity Check - Queue Status:**
```bash
curl -s http://localhost:5000/api/ops/social-queue | jq
```

**Expected Response:**
```json
{
  "total": 0,
  "byStatus": {
    "queued": 0,
    "posting": 0,
    "posted": 0,
    "failed": 0,
    "cancelled": 0,
    "paused": 0
  },
  "queue": []
}
```

---

## API Credential Setup Guide

### X/Twitter Setup

1. **Create Twitter App:**
   - Visit: https://developer.twitter.com/en/portal/projects-and-apps
   - Create a new project and app
   - Enable OAuth 1.0a (read + write permissions)

2. **Get API Credentials:**
   - Copy API Key → `X_API_KEY`
   - Copy API Secret → `X_API_SECRET`

3. **Generate User Tokens:**
   - Use OAuth flow in app OR
   - Use developer portal to generate access token/secret for testing
   - Store via API: `POST /api/platform-credentials`

### Instagram Setup

1. **Create Facebook App:**
   - Visit: https://developers.facebook.com/apps
   - Create app → Business type

2. **Add Instagram Basic Display:**
   - Dashboard → Add Products → Instagram Basic Display
   - Configure OAuth redirect URI

3. **Get Business Account:**
   - Need Instagram Business or Creator account
   - Link to Facebook Page

4. **Generate Long-Lived Token:**
   - Use Graph API Explorer or OAuth flow
   - Store via API: `POST /api/platform-credentials`

### LinkedIn Setup

1. **Create LinkedIn App:**
   - Visit: https://www.linkedin.com/developers/apps
   - Create app
   - Request "Sign In with LinkedIn" product

2. **Get Credentials:**
   - Client ID → `LINKEDIN_CLIENT_ID`
   - Client Secret → `LINKEDIN_CLIENT_SECRET`

3. **OAuth Flow:**
   - Implement 3-legged OAuth
   - Store tokens via API: `POST /api/platform-credentials`

---

## Verification Steps

### 1. Check Database Tables
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'social%' OR table_name = 'platform_credentials';
```

**Expected:**
- social_queue
- social_rate_limits
- social_rl_usage
- social_rl_overrides
- platform_credentials

### 2. Test Rate Limits
```bash
curl -s http://localhost:5000/api/ops/rate-limits | jq
```

**Expected:** All 6 platforms with default limits.

### 3. Store Test Credentials
```bash
curl -X POST http://localhost:5000/api/platform-credentials \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "x",
    "profileId": "test_profile_123",
    "profileName": "Test Account",
    "credentials": {
      "appKey": "test_key",
      "appSecret": "test_secret",
      "accessToken": "test_token",
      "accessSecret": "test_token_secret"
    }
  }'
```

### 4. Queue Test Post
```bash
curl -X POST http://localhost:5000/api/integrations/icadence/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "schedule.posted",
    "profile_id": "test_profile_123",
    "platform": "x",
    "scheduled_at": "2025-11-06T12:00:00Z",
    "content": {
      "text": "Test post from Gigster Garage!"
    }
  }'
```

---

## Troubleshooting

### Worker not processing jobs
- Check `npm run dev` logs for worker startup message
- Verify `SOCIAL_WORKER_POLL_MS` is set (default: 5000ms)
- Check queue status: `SELECT * FROM social_queue LIMIT 10;`

### Rate limit errors
- Check platform limits: `SELECT * FROM social_rate_limits;`
- Reset window: `UPDATE social_rate_limits SET used_actions = 0, window_started_at = NOW();`

### Credential validation fails
- Verify credentials in database: `SELECT platform, profile_id, status FROM platform_credentials;`
- Test validation: `POST /api/platform-credentials/{id}/validate`

### Media upload fails
- Check `SOCIAL_MEDIA_MAX_BYTES` (default: 10MB)
- Verify media URL is accessible (http/https only)
- Check media cache: `SELECT * FROM media_head_cache LIMIT 10;`

---

## Next Steps

Once bootstrapping is complete:

1. **Set up OAuth flows** - Implement frontend UI for users to connect accounts
2. **Test real posts** - With actual platform credentials
3. **Monitor queue** - Use `/ops/social-queue` and `/ops/rate-limits` dashboards
4. **Scale workers** - Adjust `CONCURRENCY` based on load

---

## Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | ✅ Complete | All 5 tables created |
| Rate Limits | ✅ Complete | Defaults initialized |
| API Routes | ✅ Complete | All routes mounted |
| Platform Adapters | ✅ Complete | X, Instagram, LinkedIn ready |
| Worker | ✅ Ready | Needs credentials to process |
| OAuth UI | ⏳ Pending | Frontend not yet implemented |
| Documentation | ✅ Complete | This guide + USER_MANUAL.md |

---

**Ready to process social media posts!** 🚀

Just add your platform API credentials and start queuing posts.
