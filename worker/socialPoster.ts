import { pool } from "../server/db.js";
import { getAdapter } from "../server/integrations/icadence/platforms.js";
import { tryConsume } from "../server/lib/rateLimiter.js";
import { audit } from "../server/lib/audit.js";

const POLL_MS = Number(process.env.SOCIAL_WORKER_POLL_MS ?? 5000);
const BASE_BACKOFF_MS = 15_000;
const MAX_BACKOFF_MS = 30 * 60_000;
const MAX_ATTEMPTS = 8;

function nextBackoff(attempts: number) {
  const jitter = Math.floor(Math.random() * 1000);
  const delay = Math.min(BASE_BACKOFF_MS * Math.pow(2, attempts), MAX_BACKOFF_MS);
  return delay + jitter;
}

async function fetchReadyJobs(limit = 10) {
  const { rows } = await pool.query(
    `SELECT * FROM social_queue
     WHERE status IN ('queued', 'failed')
       AND (scheduled_at <= now())
       AND (next_attempt_at IS NULL OR next_attempt_at <= now())
     ORDER BY scheduled_at ASC
     LIMIT $1`,
    [limit]
  );
  return rows;
}

async function mark(id: string, data: Record<string, any>) {
  const keys = Object.keys(data);
  const sets = keys.map((k, i) => `${k}=$${i + 2}`).join(", ");
  await pool.query(
    `UPDATE social_queue SET ${sets} WHERE id=$1`,
    [id, ...keys.map(k => data[k])]
  );
}

async function workOne(job: any) {
  // Rate limit check first
  const gate = await tryConsume(job.platform);
  if (!gate.allowed) {
    const waitMs = gate.retryAfterMs ?? nextBackoff(job.attempts || 0);
    await mark(job.id, { next_attempt_at: new Date(Date.now() + waitMs) });
    await audit.emit("social.queue.rate_limited", { id: job.id, platform: job.platform, waitMs });
    return;
  }

  const adapter = getAdapter(job.platform);
  const content = job.content || {};
  
  try {
    await mark(job.id, { status: 'posting', last_error: null });
    await audit.emit("social.queue.posting", { id: job.id, platform: job.platform });
    
    const res = await adapter.post({
      profileId: job.profile_id,
      text: content.text || "",
      mediaUrls: content.mediaUrls || []
    });

    if (res.ok) {
      await mark(job.id, {
        status: 'posted',
        attempts: job.attempts + 1,
        last_error: null,
        next_attempt_at: null
      });
      await audit.emit("social.queue.posted", { id: job.id, platform: job.platform, remoteId: res.remoteId });
      console.log(`[social] posted ${job.platform} ${job.id}`);
    } else {
      const attempts = job.attempts + 1;
      const backoffMs = attempts >= MAX_ATTEMPTS ? null : nextBackoff(attempts);
      await mark(job.id, {
        status: 'failed',
        attempts,
        last_error: res.error,
        next_attempt_at: backoffMs ? new Date(Date.now() + backoffMs) : null
      });
      await audit.emit("social.queue.failed", { id: job.id, platform: job.platform, error: res.error, attempts });
      console.warn(`[social] failed ${job.id}: ${res.error}`);
    }
  } catch (e: any) {
    const attempts = job.attempts + 1;
    const backoffMs = attempts >= MAX_ATTEMPTS ? null : nextBackoff(attempts);
    await mark(job.id, {
      status: 'failed',
      attempts,
      last_error: e.message?.slice(0, 500) || "error",
      next_attempt_at: backoffMs ? new Date(Date.now() + backoffMs) : null
    });
    await audit.emit("social.queue.error", { id: job.id, platform: job.platform, error: e.message, attempts });
    console.warn(`[social] error ${job.id}: ${e.message}`);
  }
}

async function loop() {
  try {
    const jobs = await fetchReadyJobs();
    for (const j of jobs) {
      if (["paused", "cancelled", "posted", "posting"].includes(j.status)) continue;
      await workOne(j);
    }
  } catch (e) {
    console.error("[social] tick error", e);
  } finally {
    setTimeout(loop, POLL_MS);
  }
}

console.log("[social] worker v2 started");
loop();
