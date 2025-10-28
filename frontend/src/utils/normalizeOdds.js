export function normalizeOdds(raw) {
  if (raw == null) return null;
  let n = Number.NaN;
  if (typeof raw === 'number') n = raw;
  else if (typeof raw === 'string') n = parseFloat(raw);
  else if (typeof raw === 'object') {
    if (raw.value != null) n = Number(raw.value);
    else if (raw.percent != null) n = Number(raw.percent) / 100;
    else if (raw.decimal != null) {
      const dec = Number(raw.decimal);
      n = isFinite(dec) && dec !== 0 ? 1 / dec : Number.NaN;
    }
  }
  if (!isFinite(n)) return null;
  if (n > 1 && n <= 100) n = n / 100; // 62 -> 0.62
  return Math.max(0.02, Math.min(0.98, n)); // clamp
}
export function oddsToPctString(raw) {
  const n = normalizeOdds(raw);
  return n == null ? '—' : `${(n * 100).toFixed(0)}%`;
}
