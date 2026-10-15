/**
 * videoPrefetch.js
 * ─────────────────────────────────────────────────────────────────
 * YouTube-style "warm start": when the user hovers / focuses a thumbnail we
 * quietly fetch what the player will need first:
 *   master.m3u8 → lowest-bitrate variant playlist → init segment → first media segment
 *
 * The responses land in the browser HTTP cache (segments are served with
 * long-lived Cache-Control), so when the watch page mounts hls.js gets them
 * instantly and first frame appears almost immediately.
 *
 * Everything is best-effort: failures are swallowed, nothing blocks the UI,
 * and we skip prefetching on data-saver / very slow connections.
 */

const done = new Set();
const inflight = new Map();
const MAX_PREFETCHED = 24;

function connectionAllowsPrefetch() {
  const c = typeof navigator !== 'undefined' && navigator.connection;
  if (!c) return true;
  if (c.saveData) return false;
  return !['slow-2g', '2g'].includes(c.effectiveType);
}

const resolveUrl = (ref, base) => new URL(ref, base).toString();

async function fetchText(url, signal) {
  const res = await fetch(url, { mode: 'cors', signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function warm(url, signal) {
  const res = await fetch(url, { mode: 'cors', signal });
  // Drain the body so the full response is committed to the HTTP cache
  await res.arrayBuffer();
}

/** Pick the lowest-BANDWIDTH variant from a master playlist. */
function lowestVariant(masterText, masterUrl) {
  const lines = masterText.split('\n');
  let best = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('#EXT-X-STREAM-INF')) continue;
    const bw = Number((line.match(/BANDWIDTH=(\d+)/) || [])[1] || Infinity);
    const uri = (lines[i + 1] || '').trim();
    if (uri && (!best || bw < best.bw)) best = { bw, uri };
  }
  return best ? resolveUrl(best.uri, masterUrl) : null;
}

async function prefetchHls(masterUrl, signal) {
  const masterText = await fetchText(masterUrl, signal);
  const variantUrl = lowestVariant(masterText, masterUrl);
  if (!variantUrl) return;
  const variantText = await fetchText(variantUrl, signal);

  const toWarm = [];
  const map = variantText.match(/#EXT-X-MAP:URI="([^"]+)"/);
  if (map) toWarm.push(resolveUrl(map[1], variantUrl));
  const firstSeg = variantText
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('#'));
  if (firstSeg) toWarm.push(resolveUrl(firstSeg, variantUrl));

  await Promise.all(toWarm.map((u) => warm(u, signal)));
}

/** Returns the stream URL the player will use for this video object. */
export function getStreamUrl(video) {
  if (!video) return null;
  if (video.hlsUrl && video.transcodingStatus === 'ready') return video.hlsUrl;
  return video.link || video.videoUrl || null;
}

/**
 * Start prefetching a video. Safe to call repeatedly.
 * @returns {() => void} cancel function (call on mouse leave)
 */
export function prefetchVideo(video) {
  const url = getStreamUrl(video);
  if (
    !url ||
    done.has(url) ||
    inflight.has(url) ||
    !connectionAllowsPrefetch()
  ) {
    return () => {};
  }
  // Only HLS benefits meaningfully; MP4 fallback would download too much
  if (!url.includes('.m3u8')) return () => {};

  const controller = new AbortController();
  const p = prefetchHls(url, controller.signal)
    .then(() => {
      done.add(url);
      if (done.size > MAX_PREFETCHED) done.delete(done.values().next().value);
    })
    .catch(() => {})
    .finally(() => inflight.delete(url));
  inflight.set(url, { controller, p });

  return () => {
    // Let a nearly-done prefetch finish; abort only if still in flight
    const entry = inflight.get(url);
    if (entry) entry.controller.abort();
  };
}

/**
 * Convenience: returns props to spread onto a thumbnail element.
 * Waits a short "intent" delay so fast mouse sweeps don't trigger downloads.
 */
export function prefetchHandlers(video, delayMs = 120) {
  let timer = null;
  let cancel = null;
  const start = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      cancel = prefetchVideo(video);
    }, delayMs);
  };
  const stop = () => {
    clearTimeout(timer);
    // Keep prefetched data; only abort in-flight work if the user left quickly
    if (cancel) cancel();
    cancel = null;
  };
  return {
    onMouseEnter: start,
    onFocus: start,
    onTouchStart: () => {
      cancel = prefetchVideo(video);
    },
    onMouseLeave: stop,
    onBlur: stop,
  };
}

/** Minimal preview object passed via router state so the watch page can render instantly. */
export function toPreview(video) {
  if (!video) return undefined;
  return {
    _id: video._id,
    shortCode: video.shortCode,
    title: video.title,
    thumbnail: video.thumbnail,
    link: video.link,
    hlsUrl: video.hlsUrl,
    transcodingStatus: video.transcodingStatus,
  };
}
