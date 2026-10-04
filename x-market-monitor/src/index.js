import { loadConfig } from "./config.js";
import { fetchNewPosts } from "./x.js";
import { createJev } from "./jev.js";
import { formatAlert, sendTelegram } from "./telegram.js";
import { loadState, saveState } from "./state.js";

const args = new Set(process.argv.slice(2));
const once = args.has("--once") || process.argv.some((a) => a.startsWith("--lookback="));
const dryRun = args.has("--dry-run");
const lookbackArg = process.argv.find((a) => a.startsWith("--lookback="));
const lookbackMinutes = lookbackArg ? Number(lookbackArg.split("=")[1]) : 0;
// A lookback run is a one-off test: score that window, don't touch state.
const backfill = args.has("--backfill") || lookbackMinutes > 0;
const persist = !dryRun && !lookbackMinutes;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...m) => console.log(new Date().toISOString(), ...m);

export function selectAlerts(scored, threshold) {
  return scored.filter((p) => p.confidence >= threshold);
}

async function tick(config, state, scoreBatch) {
  const startTime = lookbackMinutes ? new Date(Date.now() - lookbackMinutes * 60_000).toISOString() : undefined;
  const { posts, newestId } = await fetchNewPosts(config.x, state.sinceId, startTime);
  const fresh = lookbackMinutes ? posts : posts.filter((p) => !state.seen.has(p.id));
  const save = () => persist && saveState(config.stateFile, state);
  log(`fetched ${posts.length} posts, ${fresh.length} new`);

  // First run: treat existing posts as already seen so old news isn't alerted.
  if (!state.initialized && !backfill) {
    posts.forEach((p) => state.seen.add(p.id));
    state.sinceId = newestId;
    state.initialized = true;
    save();
    log(`baseline recorded (${posts.length} existing posts skipped); alerting on new posts from now on`);
    return;
  }
  state.initialized = true;
  let passed = 0;

  for (let i = 0; i < fresh.length; i += config.jev.batchSize) {
    const batch = fresh.slice(i, i + config.jev.batchSize);
    const scored = await scoreBatch(batch);
    const alerts = selectAlerts(scored, config.jev.threshold);

    for (const post of scored) {
      log(`  [${String(post.confidence).padStart(3)}%] @${post.username}: ${post.text.slice(0, 80).replace(/\n/g, " ")}`);
    }
    passed += alerts.length;
    for (const post of alerts) {
      if (dryRun) {
        log(`DRY RUN alert:\n${formatAlert(post)}`);
      } else {
        await sendTelegram(config.telegram, formatAlert(post));
        log(`sent alert for ${post.id} (${post.confidence}%)`);
      }
    }
    // Mark the batch seen only after it was scored and delivered.
    batch.forEach((p) => state.seen.add(p.id));
    save();
  }

  log(`${passed} of ${fresh.length} posts passed the ${config.jev.threshold}% threshold`);
  state.sinceId = newestId;
  save();
}

async function main() {
  const config = loadConfig({ dryRun });
  if (lookbackMinutes) config.x.maxResults = 100;
  const state = loadState(config.stateFile);
  const scoreBatch = createJev(config.jev);

  log(
    `x-market-monitor started: ${config.x.listId ? `list ${config.x.listId}` : `query "${config.x.query}"`}, ` +
      `threshold ${config.jev.threshold}%, every ${config.pollIntervalSeconds}s${dryRun ? " (dry run)" : ""}`,
  );

  let stopping = false;
  for (const sig of ["SIGINT", "SIGTERM"]) {
    process.on(sig, () => {
      log(`${sig} received, stopping after current cycle`);
      stopping = true;
    });
  }

  while (!stopping) {
    let waitMs = config.pollIntervalSeconds * 1000;
    try {
      await tick(config, state, scoreBatch);
    } catch (err) {
      log(`cycle failed: ${err.message}`);
      if (err.retryAfterMs) waitMs = Math.max(waitMs, err.retryAfterMs);
      if (once) process.exitCode = 1;
    }
    if (once) break;
    await sleep(waitMs);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
