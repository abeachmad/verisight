export const toArray = (x) => {
  if (Array.isArray(x)) return x;
  if (x && typeof x === 'object') {
    if (Array.isArray(x.items)) return x.items;
    if (Array.isArray(x.data)) return x.data;
    if (Array.isArray(x.results)) return x.results;
    if (Array.isArray(x.list)) return x.list;
  }
  return [];
};

export const take = (x, n=10) => toArray(x).slice(0, n);

export const num = (x, d=0) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : d;
};

export const pct = (x, d=0) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : d;
};

export const fmt = (x) => num(x, 0).toLocaleString();
export const clamp100 = (v) => Math.max(0, Math.min(100, Number(v) || 0));
