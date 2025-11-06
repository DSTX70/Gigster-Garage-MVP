import { hourlyErrorRate, maxQueueAgeMinutes, rateLimitSaturation } from "./socialQueue.metrics.js";

export async function runAlerts() {
  const errorRate = await hourlyErrorRate();
  if (errorRate > 5) {
    console.warn(`[ALERT] error-rate ${errorRate.toFixed(1)}% > 5%`);
  }

  const queueAge = await maxQueueAgeMinutes();
  if (queueAge > 30) {
    console.warn(`[ALERT] queue-age ${queueAge.toFixed(1)}m > 30m`);
  }

  const rateLimits = await rateLimitSaturation();
  rateLimits.forEach(rl => {
    if (rl.pct > 90) {
      console.warn(`[ALERT] RL saturation ${rl.platform}: ${rl.pct}%`);
    }
  });
}
