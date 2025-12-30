// scripts/ci/run-pa11y.mjs
import pa11y from "pa11y";

const url = process.argv[2];

if (!url) {
  console.error("Usage: node scripts/ci/run-pa11y.mjs <url>");
  process.exit(2);
}

try {
  const result = await pa11y(url, {
    standard: "WCAG2AA",
    timeout: 60000,
    wait: 1000,
    includeNotices: true,
    includeWarnings: true,
    // Force Puppeteer to run without sandbox in GitHub Actions runners
    chromeLaunchConfig: {
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    },
  });

  // Always emit JSON so we can upload as an artifact.
  process.stdout.write(JSON.stringify(result, null, 2));

  // Big Audit v0: informational (do NOT fail the job on a11y issues yet)
  process.exit(0);
} catch (err) {
  console.error("Pa11y execution failed:", err?.message || err);
  process.exit(1);
}
