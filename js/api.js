// ══════════════════════════════════════════════════════════════════════════════
// FORGE DISTRO v2 — GitHub Releases API Module
// ═══════════════════════════════════════════════════════════════════════════════
// Pure data layer — zero DOM manipulation.
// Fetches release data from GitHub API with:
//   - Meta-tag-driven repo config (never hardcoded)
//   - sessionStorage caching (5-minute TTL)
//   - AbortController timeout (8 seconds)
//   - Response validation
//   - Typed error codes
//   - APK asset selection
//   - SHA-256 extraction from release body
//   - Total download count aggregation
// ══════════════════════════════════════════════════════════════════════════════

const CACHE_KEY = 'forge-release-cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const FETCH_TIMEOUT = 8000;       // 8 seconds
const API_BASE = 'https://api.github.com';
const ACCEPT_HEADER = 'application/vnd.github+json';
const SHA256_REGEX = /SHA-256:\s+([a-fA-F0-9]{64})/;

// ── Error codes ────────────────────────────────────────────────────────────────
const ErrorCode = {
  TIMEOUT:     'TIMEOUT',
  NETWORK:     'NETWORK',
  RATE_LIMIT:  'RATE_LIMIT',
  NO_RELEASES: 'NO_RELEASES',
  API_ERROR:   'API_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  CONFIG_ERROR: 'CONFIG_ERROR',
};

/**
 * Create a typed API error.
 * @param {string} code  - One of ErrorCode values
 * @param {string} message - Human-readable description
 * @returns {{ code: string, message: string }}
 */
function createError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

// ══════════════════════════════════════════════════════════════════════════════
//  REPO CONFIG
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Read repo owner and name from HTML meta tags.
 * Validates they are not placeholder {BRACKETS} values.
 * @returns {{ owner: string, repo: string }}
 * @throws Typed error if meta tags missing or contain placeholders
 */
export function getRepoMeta() {
  const ownerEl = document.querySelector('meta[name="forge:repo-owner"]');
  const repoEl  = document.querySelector('meta[name="forge:repo-name"]');

  const owner = ownerEl ? ownerEl.getAttribute('content') : null;
  const repo  = repoEl  ? repoEl.getAttribute('content')  : null;

  if (!owner || !repo) {
    throw createError(ErrorCode.CONFIG_ERROR, 'Missing forge:repo-owner or forge:repo-name meta tags.');
  }

  // Detect placeholder values like {OWNER}, {REPO}
  if (/^\{.+\}$/.test(owner) || /^\{.+\}$/.test(repo)) {
    throw createError(ErrorCode.CONFIG_ERROR, `Repository meta tags contain placeholder values: owner="${owner}", repo="${repo}". Configure them before deployment.`);
  }

  return { owner, repo };
}

// ══════════════════════════════════════════════════════════════════════════════
//  CACHING
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Read cached data from sessionStorage.
 * @returns {object|null} Cached payload or null if expired/missing
 */
function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const cached = JSON.parse(raw);
    if (!cached || !cached.timestamp || !cached.data) return null;

    const age = Date.now() - cached.timestamp;
    if (age > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return cached.data;
  } catch {
    // Corrupted cache — clear it
    try { sessionStorage.removeItem(CACHE_KEY); } catch { /* ignore */ }
    return null;
  }
}

/**
 * Write data to sessionStorage with timestamp.
 * @param {object} data - The data to cache
 */
function writeCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data,
    }));
  } catch {
    // sessionStorage full or unavailable — silently continue
    console.warn('[forge] sessionStorage write failed — caching disabled.');
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  FETCH HELPERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Fetch a GitHub API endpoint with timeout and error handling.
 * @param {string} url - Full API URL
 * @returns {Promise<object>} Parsed JSON response
 * @throws Typed error on failure
 */
async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': ACCEPT_HEADER,
      },
    });

    clearTimeout(timeoutId);

    // Rate limited
    if (response.status === 403) {
      throw createError(ErrorCode.RATE_LIMIT, 'GitHub API rate limit exceeded. Try again later.');
    }

    // No releases (404 on /releases/latest)
    if (response.status === 404) {
      throw createError(ErrorCode.NO_RELEASES, 'No releases found for this repository.');
    }

    // Other non-OK responses
    if (!response.ok) {
      throw createError(ErrorCode.API_ERROR, `GitHub API returned HTTP ${response.status}.`);
    }

    const data = await response.json();
    return data;

  } catch (err) {
    clearTimeout(timeoutId);

    // Re-throw typed errors
    if (err.code) throw err;

    // AbortController timeout
    if (err.name === 'AbortError') {
      throw createError(ErrorCode.TIMEOUT, 'GitHub API request timed out after 8 seconds.');
    }

    // Network errors (offline, DNS, CORS, etc.)
    throw createError(ErrorCode.NETWORK, 'Network error while contacting GitHub API.');
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  RESPONSE VALIDATION
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Validate that a release object has the expected shape.
 * @param {object} release - GitHub release object
 * @returns {boolean} True if valid
 */
function isValidRelease(release) {
  if (!release || typeof release !== 'object') return false;
  if (typeof release.tag_name !== 'string') return false;
  if (typeof release.published_at !== 'string') return false;
  if (!Array.isArray(release.assets)) return false;
  return true;
}

// ══════════════════════════════════════════════════════════════════════════════
//  DATA EXTRACTION
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Select the APK asset from a release's assets array.
 * @param {Array} assets - The assets array from a release
 * @returns {object|null} The APK asset object or null
 */
function selectApkAsset(assets) {
  const apkAssets = assets.filter(a => a.name && a.name.endsWith('.apk'));

  if (apkAssets.length === 0) {
    return null;
  }

  if (apkAssets.length > 1) {
    console.warn(`[forge] Multiple APK assets found (${apkAssets.length}). Using first: "${apkAssets[0].name}".`);
  }

  return apkAssets[0];
}

/**
 * Extract SHA-256 hash from release body text.
 * @param {string} body - Release body markdown
 * @returns {string|null} 64-character hex hash or null
 */
function extractSha256(body) {
  if (!body || typeof body !== 'string') return null;
  const match = body.match(SHA256_REGEX);
  return match ? match[1] : null;
}

/**
 * Calculate total download count across all assets of a release.
 * @param {Array} assets - The assets array
 * @returns {number} Total download count
 */
function totalDownloads(assets) {
  return assets.reduce((sum, asset) => {
    return sum + (typeof asset.download_count === 'number' ? asset.download_count : 0);
  }, 0);
}

/**
 * Parse and enrich a single release object with computed fields.
 * @param {object} release - Raw GitHub release object
 * @returns {object} Enriched release data
 */
function enrichRelease(release) {
  const apk = selectApkAsset(release.assets);
  const sha256 = extractSha256(release.body);
  const downloads = totalDownloads(release.assets);

  return {
    tag_name: release.tag_name,
    published_at: release.published_at,
    body: release.body || '',
    html_url: release.html_url || '',
    assets: release.assets,
    // Computed fields
    _apk: apk ? {
      name: apk.name,
      size: apk.size,
      browser_download_url: apk.browser_download_url,
      download_count: apk.download_count || 0,
    } : null,
    _hash: sha256,
    _downloads: downloads,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN API — loadReleaseData()
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Load release data from GitHub API.
 * Returns enriched latest release + up to 3 recent releases.
 * Caches in sessionStorage for 5 minutes.
 *
 * @returns {Promise<{ latest: object, releases: Array }>}
 * @throws Typed error with { code, message } on failure
 */
export async function loadReleaseData() {
  // Check cache first
  const cached = readCache();
  if (cached) {
    console.log(`[forge] Release data loaded from cache: ${cached.latest.tag_name}`);
    return cached;
  }

  // Read repo configuration from meta tags
  const { owner, repo } = getRepoMeta();

  const latestUrl   = `${API_BASE}/repos/${owner}/${repo}/releases/latest`;
  const releasesUrl = `${API_BASE}/repos/${owner}/${repo}/releases?per_page=3`;

  try {
    // Parallel fetch — both calls at once
    const [latestRaw, releasesRaw] = await Promise.all([
      fetchWithTimeout(latestUrl),
      fetchWithTimeout(releasesUrl),
    ]);

    // Validate latest release
    if (!isValidRelease(latestRaw)) {
      throw createError(ErrorCode.PARSE_ERROR, 'Latest release response has unexpected structure.');
    }

    // Validate releases array
    if (!Array.isArray(releasesRaw)) {
      throw createError(ErrorCode.PARSE_ERROR, 'Releases list response is not an array.');
    }

    // Check for empty releases
    if (releasesRaw.length === 0) {
      throw createError(ErrorCode.NO_RELEASES, 'No releases found for this repository.');
    }

    // Enrich all releases
    const latest = enrichRelease(latestRaw);
    const releases = releasesRaw
      .filter(isValidRelease)
      .map(enrichRelease);

    const result = { latest, releases };

    // Cache the result
    writeCache(result);

    console.log(`[forge] Release data loaded: ${latest.tag_name}`);
    return result;

  } catch (err) {
    // Log typed errors
    if (err.code) {
      console.error(`[forge] API error: ${err.code} — ${err.message}`);
    } else {
      console.error(`[forge] API error: UNKNOWN — ${err.message}`);
      err.code = ErrorCode.NETWORK;
    }
    throw err;
  }
}
