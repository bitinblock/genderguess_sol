const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SENTIMENT_ICON = { bullish: "🟢", bearish: "🔴", neutral: "⚪", mixed: "🟡" };

export function formatAlert(post) {
  const tickers = post.tickers?.length ? post.tickers.map((t) => `$${t.replace(/^\$/, "")}`).join(" ") : "—";
  return [
    `${SENTIMENT_ICON[post.sentiment] || "⚪"} <b>JEV ${post.confidence}%</b> · ${escapeHtml(post.sentiment)} · ${escapeHtml(tickers)}`,
    "",
    `<b>@${escapeHtml(post.username)}</b>: ${escapeHtml(post.text)}`,
    "",
    `<i>${escapeHtml(post.reason)}</i>`,
    `<a href="${post.url}">View on X</a>`,
  ].join("\n");
}

export async function sendTelegram({ botToken, chatId }, text, attempt = 0) {
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
  });
  if (res.status === 429 && attempt < 3) {
    const body = await res.json().catch(() => ({}));
    const waitS = body.parameters?.retry_after ?? 5;
    await new Promise((r) => setTimeout(r, waitS * 1000));
    return sendTelegram({ botToken, chatId }, text, attempt + 1);
  }
  if (!res.ok) throw new Error(`Telegram ${res.status}: ${await res.text()}`);
}
