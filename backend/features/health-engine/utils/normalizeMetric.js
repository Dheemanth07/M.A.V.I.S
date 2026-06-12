export function normalizeMetric(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

