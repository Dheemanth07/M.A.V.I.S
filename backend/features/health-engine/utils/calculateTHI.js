// Placeholder helper for THI-based aggregation logic (if needed later).
// Currently returns the input as THI normalization is handled in evaluators.

export function calculateTHI(thiValue) {
  const n = Number(thiValue);
  if (!Number.isFinite(n)) return null;
  return n;
}

