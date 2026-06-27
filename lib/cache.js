// In-memory result cache + per-IP token bucket.
// ponytail: in-memory Map; swap to Upstash/Redis when you run multiple instances.

const store = new Map(); // key -> { value, expires }

export function cacheGet(key) {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() > e.expires) {
    store.delete(key);
    return null;
  }
  return e.value;
}

export function cacheSet(key, value, ttlMs) {
  store.set(key, { value, expires: Date.now() + ttlMs });
  if (store.size > 500) store.delete(store.keys().next().value); // crude LRU eviction
}

const buckets = new Map(); // ip -> { count, reset }

// Fixed-window limiter. Returns false when the caller is over budget.
export function rateLimit(ip, max = 12, windowMs = 60_000) {
  const now = Date.now();
  const b = buckets.get(ip) ?? { count: 0, reset: now + windowMs };
  if (now > b.reset) {
    b.count = 0;
    b.reset = now + windowMs;
  }
  b.count++;
  buckets.set(ip, b);
  return b.count <= max;
}
