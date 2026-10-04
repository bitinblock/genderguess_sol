import fs from "node:fs";

const MAX_SEEN = 5000;

export function loadState(path) {
  try {
    const raw = JSON.parse(fs.readFileSync(path, "utf8"));
    return { sinceId: raw.sinceId || null, seen: new Set(raw.seen || []) };
  } catch {
    return { sinceId: null, seen: new Set() };
  }
}

export function saveState(path, state) {
  const seen = [...state.seen].slice(-MAX_SEEN);
  state.seen = new Set(seen);
  fs.writeFileSync(path, JSON.stringify({ sinceId: state.sinceId, seen }, null, 2));
}
