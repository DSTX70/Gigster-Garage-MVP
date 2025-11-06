import { pool } from "../server/db.js";
import { getAdapter } from "../server/integrations/icadence/platforms.js";

const POLL_MS = Number(process.env.SOCIAL_WORKER_POLL_MS ?? 5000);
const BASE_BACKOFF_MS = 15_000;
const MAX_BACKOFF_MS = 30 * 60_000;
const MAX_ATTEMPTS = 8;

function nextBackoff(attempts: number) {
  const delay = Math.min(BASE_BACKOFF_MS * Math.pow(2, attempts), MAX_BACKOFF_MS);
  return new Date(Date.now() + delay);
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
  const adapter = getAdapter(job.platform);
  const content = job.content || {};
  
  try {
    await mark(job.id, { status: 'posting', last_error: null });
    
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
      console.log(`[social] posted ${job.platform} ${job.id}`);
    } else {
      const attempts = job.attempts + 1;
      const next = attempts >= MAX_ATTEMPTS ? null : nextBackoff(attempts);
      await mark(job.id, {
        status: attempts >= MAX_ATTEMPTS ? 'failed' : 'failed',
        attempts,
        last_error: res.error,
        next_attempt_at: next
      });
      console.warn(`[social] failed ${job.id}: ${res.error}`);
    }
  } catch (e: any) {
    const attempts = job.attempts + 1;
    const next = attempts >= MAX_ATTEMPTS ? null : nextBackoff(attempts);
    await mark(job.id, {
      status: attempts >= MAX_ATTEMPTS ? 'failed' : 'failed',
      attempts,
      last_error: e.message?.slice(0, 500) || "error",
      next_attempt_at: next
    });
    console.warn(`[social] error ${job.id}: ${e.message}`);
  }
}

async function tick() {
  try {
    const jobs = await fetchReadyJobs();
    for (const j of jobs) {
      if (j.status === "paused" || j.status === "cancelled") continue;
      await workOne(j);
    }
  } catch (e) {
    console.error("[social] tick error", e);
  } finally {
    setTimeout(tick, POLL_MS);
  }
}

console.log("[social] worker started");
tick();
