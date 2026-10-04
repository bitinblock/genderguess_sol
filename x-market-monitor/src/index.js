import { loadConfig } from "./config.js";
import { fetchNewPosts } from "./x.js";
import { createJev } from "./jev.js";
import { formatAlert, sendTelegram } from "./telegram.js";
import { loadState, saveState } from "./state.js";

const args = new Set(process.argv.slice(2));
const once = args.has("--once");
const dryRun = args.has("--dry-run");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...m) => console.log(new Date().toISOString(), ...m);

export function selectAlerts(scored, threshold) {
  return scored.filter((p) => p.confidence >= threshold);
}

async function tick(config, state, scoreBatch) {
  const { posts, newestId } = await fetchNewPosts(config.x, state.sinceId);
  const fresh = posts.filter((p) => !state.seen.has(p.id));
  log(`fetched ${posts.length} posts, ${fresh.length} new`);

  for (let i = 0; i < fresh.length; i += config.jev.batchSize) {
    const batch = fresh.slice(i, i + config.jev.batchSize);
    const scored = await scoreBatch(batch);
    const alerts = selectAlerts(scored, config.jev.threshold);

    for (const post of scored) {
      log(`  [${String(post.confidence).padStart(3)}%] @${post.username}: ${post.text.slice(0, 80).replace(/\n/g, " ")}`);
    }
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
    saveState(config.stateFile, state);
  }

  state.sinceId = newestId;
  saveState(config.stateFile, state);
}

async function main() {
  const config = loadConfig({ dryRun });
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
