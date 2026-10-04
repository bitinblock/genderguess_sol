import test from "node:test";
import assert from "node:assert/strict";
import { formatAlert } from "../src/telegram.js";
import { selectAlerts } from "../src/index.js";
import { createJev } from "../src/jev.js";
import { accountsQuery } from "../src/config.js";

test("accountsQuery builds from: queries from handles and URLs", () => {
  assert.equal(accountsQuery("https://x.com/LiveSquawk"), "from:LiveSquawk -is:retweet");
  assert.equal(accountsQuery("@LiveSquawk, DeItaone"), "(from:LiveSquawk OR from:DeItaone) -is:retweet");
});

const post = {
  id: "1",
  text: "NVDA beats <estimates> & raises guidance",
  username: "news",
  url: "https://x.com/news/status/1",
};

test("selectAlerts keeps posts at or above the threshold", () => {
  const scored = [69, 70, 95].map((confidence, i) => ({ ...post, id: String(i), confidence }));
  assert.deepEqual(selectAlerts(scored, 70).map((p) => p.confidence), [70, 95]);
});

test("formatAlert escapes HTML and lists tickers", () => {
  const msg = formatAlert({ ...post, confidence: 92, sentiment: "bullish", tickers: ["NVDA"], reason: "Earnings beat" });
  assert.match(msg, /JEV 92%/);
  assert.match(msg, /\$NVDA/);
  assert.match(msg, /&lt;estimates&gt; &amp; raises/);
});

test("JEV merges scores by id and clamps confidence", async () => {
  const fakeClient = {
    beta: {
      messages: {
        create: async () => ({
          stop_reason: "end_turn",
          content: [
            {
              type: "text",
              text: JSON.stringify({
                results: [{ id: "1", confidence: 140, tickers: ["NVDA"], sentiment: "bullish", reason: "beat" }],
              }),
            },
          ],
        }),
      },
    },
  };
  const score = createJev({ model: "claude-opus-5-5", effort: "low" }, fakeClient);
  const [result] = await score([post]);
  assert.equal(result.confidence, 100);
  assert.equal(result.url, post.url);
});

test("JEV skips a refused batch", async () => {
  const fakeClient = { beta: { messages: { create: async () => ({ stop_reason: "refusal", content: [] }) } } };
  const score = createJev({ model: "claude-opus-5-5", effort: "low" }, fakeClient);
  assert.deepEqual(await score([post]), []);
});
