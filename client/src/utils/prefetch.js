// Start a GET request early (on hover / touch) and hand the same in-flight
// response to the page when it mounts, instead of the page starting its own
// request only after its code has downloaded.
//
// A prefetched response is used at most once and only within PREFETCH_MAX_AGE_MS,
// so pages never show stale data (e.g. after an admin edit).

const PREFETCH_MAX_AGE_MS = 60 * 1000;
const pending = new Map(); // url -> { promise, at }

export function prefetchUrl(url) {
  const existing = pending.get(url);
  if (existing && Date.now() - existing.at < PREFETCH_MAX_AGE_MS) return;
  const promise = fetch(url, { credentials: 'include' });
  promise.catch(() => pending.delete(url));
  pending.set(url, { promise, at: Date.now() });
}

// Drop-in replacement for `fetch(url)` on a page's initial GET.
export function fetchPrefetched(url) {
  const existing = pending.get(url);
  pending.delete(url);
  if (existing && Date.now() - existing.at < PREFETCH_MAX_AGE_MS) return existing.promise;
  return fetch(url, { credentials: 'include' });
}
