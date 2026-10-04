# x-market-monitor

Continuously watches an X feed, runs every new post through **JEV** (a Claude-based relevance scorer) to get a 0–100% confidence that it matters to the stock market, and sends posts scoring **70% or higher** to Telegram.

```
X API (search query or list)  ──►  JEV score (Claude, JSON schema)  ──►  ≥ 70%?  ──►  Telegram
        every 60s                    confidence, tickers, sentiment,                   alert
                                     reason
```

## Setup

1. **X API**: create an app at https://developer.x.com and copy the bearer token. The recent-search endpoint needs the Basic tier or higher.
2. **Telegram**: message `@BotFather` → `/newbot` → copy the token. Send your bot a message, then open `https://api.telegram.org/bot<TOKEN>/getUpdates` to find your `chat.id`. For a channel, add the bot as admin and use `@channelname`.
3. **Anthropic**: get an API key at https://console.anthropic.com.

```bash
cd x-market-monitor
npm install
cp .env.example .env   # fill in the keys
npm run dry-run        # one cycle, prints alerts instead of sending
npm start              # runs continuously
```

## Configuration (`.env`)

| Variable | Default | Purpose |
|---|---|---|
| `X_QUERY` | market keywords, English, no retweets | X search query that defines the feed |
| `X_LIST_ID` | — | Watch an X list instead of a query (e.g. a list of analysts and news accounts) |
| `CONFIDENCE_THRESHOLD` | `70` | Minimum JEV score to forward to Telegram |
| `POLL_INTERVAL_SECONDS` | `60` | How often to poll X |
| `JEV_MODEL` / `JEV_EFFORT` | `claude-opus-5-5` / `low` | Scoring model and reasoning effort |
| `JEV_BATCH_SIZE` | `20` | Posts scored per Claude request |

State (last seen post id and recently processed ids) is kept in `state.json`, so restarts don't resend alerts.

## Running 24/7

It has to run on a machine that stays on (a VPS, a home server, or a cloud VM):

```bash
# pm2
npm i -g pm2 && pm2 start src/index.js --name x-market-monitor && pm2 save

# or systemd: ExecStart=/usr/bin/node /path/to/x-market-monitor/src/index.js
#             WorkingDirectory=/path/to/x-market-monitor  Restart=always
```

## Notes

- The scorer uses Claude's server-side refusal fallback (`fallbacks: "default"`), so a declined batch is retried on another model; a batch that is still refused is skipped and logged.
- Post text is treated as untrusted data in the prompt; JEV is told never to follow instructions inside posts.
- X rate limits are honored: on HTTP 429 the loop waits until the reset time.
- The cost scales with post volume. Narrow `X_QUERY`, or use a curated `X_LIST_ID`, to keep it down.
- `npm test` runs the unit tests (no network needed).
