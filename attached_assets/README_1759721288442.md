# Forge + Sentinel — Phase 1 Hardening Kit

This kit automates the verification steps you outlined for staging hardening.

## Files
- `verify_staging.sh` — main script. Generates evidence in `/tmp/gg_verify` and bundles `staging_verification_evidence.tgz`.
- `.env.sample` — configure your staging domain, token, and DB vars here.
- `sql/idempotency_check.sql` — DB query to ensure idempotent Time→Invoice import.
- `curl_snippets.md` — one-liners for quick manual checks (headers, health, limiter loop).
- `README.md` — this file.

## Usage
```bash
cp .env.sample .env
# Edit .env with your values
chmod +x verify_staging.sh
source .env
./verify_staging.sh
```

Evidence will be saved under `/tmp/gg_verify` and a bundle at `/tmp/gg_verify/staging_verification_evidence.tgz`.

> Note: The script uses only standard tools: `bash`, `curl`, `grep/egrep`, `sort`, `uniq`, `date`, and optionally `psql` if `DATABASE_URL` is provided.
