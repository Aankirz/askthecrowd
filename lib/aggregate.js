import { sources } from "./sources/index.js";

// Run every enabled suggestion source in parallel; merge flat lists.
// One source dying never breaks the response — wall-clock = slowest source.
export async function aggregate(seed) {
  const active = sources.filter((s) => s.enabled());
  const results = await Promise.all(
    active.map(async (s) => {
      try {
        return await s.fetch(seed);
      } catch {
        return [];
      }
    })
  );
  return results.flat();
}
