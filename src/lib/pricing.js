export function effectivePrice(price, discount = 0) {
  const p = Number(price);
  const d = Math.min(100, Math.max(0, Number(discount) || 0));
  return Math.round(p * (1 - d / 100) * 100) / 100;
}
