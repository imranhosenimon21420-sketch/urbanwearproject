/**
 * @param {Record<string, string | string[] | undefined> | undefined} raw
 */
export function searchParamsToURLSearchParams(raw) {
  const sp = new URLSearchParams();
  if (!raw) return sp;
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) sp.append(key, String(v));
    } else {
      sp.set(key, String(value));
    }
  }
  return sp;
}
