import API_BASE_URL from './api';

// Lets the Seeds & Footprints list start loading a folder before the click lands
// (on hover / touch), so the folder page can use that in-flight request instead
// of starting its own only after its code has downloaded.

const PREFETCH_MAX_AGE_MS = 60 * 1000;
const pending = new Map(); // id -> { promise, at }

const requestFolder = (id) =>
  fetch(`${API_BASE_URL}/api/seedsandfootprints/folders/${id}`).then((r) => {
    if (!r.ok) {
      return r.text().then((text) => {
        throw new Error(`HTTP ${r.status}: ${text}`);
      });
    }
    return r.json();
  });

export const loadSeedsFolderPage = () => import('../components/SeedsFootprintsDetail.jsx');

export function prefetchSeedsFolder(id) {
  if (!id) return;
  const existing = pending.get(id);
  if (existing && Date.now() - existing.at < PREFETCH_MAX_AGE_MS) return;
  const promise = requestFolder(id);
  promise.catch(() => pending.delete(id));
  pending.set(id, { promise, at: Date.now() });
  loadSeedsFolderPage().catch(() => {});
}

// Used by the folder page: reuse a recent prefetch once, otherwise fetch fresh
// (so data is never more than a minute old, and edits are picked up on revisit).
export function fetchSeedsFolder(id) {
  const existing = pending.get(id);
  pending.delete(id);
  if (existing && Date.now() - existing.at < PREFETCH_MAX_AGE_MS) return existing.promise;
  return requestFolder(id);
}
