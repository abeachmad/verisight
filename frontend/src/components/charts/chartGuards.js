export const toArr = (x) => Array.isArray(x) ? x : (x ? [x] : []);
export const nonEmpty = (a) => Array.isArray(a) && a.length > 0;
export const hasAnyPositive = (a, key) => Array.isArray(a) && a.some(i => Number(i?.[key]) > 0);

// synthesize 7-day series if points < 2 (deterministic around lastValue or 20000)
export const ensureSeries7 = (arr) => {
  const src = toArr(arr);
  if (src.length >= 2) return src;
  const base = Number(src[0]?.usd) || 20000;
  const start = new Date('2025-01-01T00:00:00Z');
  const out = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const usd = Math.round(base * (0.92 + 0.03 * i + 0.02 * Math.sin(i * 1.3)));
    out.push({ d: d.toISOString().slice(0,10), usd });
  }
  return out;
};

export const ensureBuckets = (arr) => {
  const src = toArr(arr);
  if (hasAnyPositive(src, 'count')) return src;
  return [
    { range: '50–60', count: 120 },
    { range: '60–70', count: 145 },
    { range: '70–80', count: 125 },
    { range: '80–90', count: 105 },
    { range: '90–100', count: 55 }
  ];
};

export const ensureCategories = (arr) => {
  const src = toArr(arr);
  if (hasAnyPositive(src, 'value')) return src;
  return [
    { name: 'Crypto', value: 30 },
    { name: 'Politics', value: 22 },
    { name: 'Sports', value: 18 },
    { name: 'Tech', value: 16 },
    { name: 'Other', value: 12 }
  ];
};
