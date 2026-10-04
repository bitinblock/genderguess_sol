import fs from "node:fs";

// Minimal .env loader so the service runs without extra dependencies.
function loadDotEnv(path = ".env") {
  if (!fs.existsSync(path)) return;
  for (const line of fs.readFileSync(path, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}`);
  return value;
}

export function loadConfig({ dryRun = false } = {}) {
  loadDotEnv();
  const env = process.env;

  const config = {
    x: {
      bearerToken: required("X_BEARER_TOKEN"),
      // Either a search query or a list ID defines "the feed".
      query:
        env.X_QUERY ||
        "(stocks OR earnings OR Fed OR CPI OR $SPY OR $QQQ OR IPO OR guidance) lang:en -is:retweet",
      listId: env.X_LIST_ID || "",
      maxResults: Number(env.X_MAX_RESULTS || 50),
    },
    jev: {
      model: env.JEV_MODEL || "claude-opus-5-5",
      effort: env.JEV_EFFORT || "low",
      threshold: Number(env.CONFIDENCE_THRESHOLD || 70),
      batchSize: Number(env.JEV_BATCH_SIZE || 20),
    },
    telegram: {
      botToken: dryRun ? env.TELEGRAM_BOT_TOKEN || "" : required("TELEGRAM_BOT_TOKEN"),
      chatId: dryRun ? env.TELEGRAM_CHAT_ID || "" : required("TELEGRAM_CHAT_ID"),
    },
    pollIntervalSeconds: Number(env.POLL_INTERVAL_SECONDS || 60),
    stateFile: env.STATE_FILE || "./state.json",
  };

  if (config.jev.threshold < 0 || config.jev.threshold > 100) {
    throw new Error("CONFIDENCE_THRESHOLD must be between 0 and 100");
  }
  return config;
}
