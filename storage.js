import { nowISO } from "./utils.js";

const KEY = "delulu_history_v1";

export function loadHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(item) {
  const history = loadHistory();
  history.unshift({ ...item, savedAt: nowISO() });
  // keep last 25
  const trimmed = history.slice(0, 25);
  localStorage.setItem(KEY, JSON.stringify(trimmed));
  return trimmed;
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}
