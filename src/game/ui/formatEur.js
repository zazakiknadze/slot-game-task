export function formatEur(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  const s = n.toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  return `${s} EUR`;
}
