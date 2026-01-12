export function $(id) {
  return document.getElementById(id);
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function nowISO() {
  return new Date().toISOString();
}

export function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch {}
    document.body.removeChild(ta);
    return true;
  }
}

export function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadDataURL(filename, dataURL) {
  const a = document.createElement("a");
  a.href = dataURL;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function stableHash(str) {
  // Simple deterministic hash for “session id”
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
