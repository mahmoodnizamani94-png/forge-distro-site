// ══════════════════════════════════════════════════════════════════════════════
// FORGE DISTRO v2 — Release Card + Download CTA Module
// ═══════════════════════════════════════════════════════════════════════════════
// Populates the release card, download CTA, version badge, footer version,
// and SHA-256 section from API data.
//
// Trust hierarchy (population order):
//   1. Version truth (version badge, header)
//   2. Download truth (CTA href, file size)
//   3. Checksum truth (SHA-256 display)
//
// All DOM via textContent / setAttribute — never innerHTML.
// ══════════════════════════════════════════════════════════════════════════════

// ── Error messages by code ─────────────────────────────────────────────────────
const ERROR_MESSAGES = {
  TIMEOUT:      'Could not load release data — request timed out. ',
  NETWORK:      'Could not load release data — network error. ',
  RATE_LIMIT:   'Could not load release data — GitHub API may be rate-limited. ',
  NO_RELEASES:  'No releases yet — the first release hasn\'t landed. ',
  API_ERROR:    'Could not load release data — API error. ',
  PARSE_ERROR:  'Could not load release data — unexpected response. ',
  CONFIG_ERROR: 'Repository not configured — meta tags contain placeholder values. ',
};

// ── DOM element cache ──────────────────────────────────────────────────────────
let els = {};

/**
 * Cache all DOM elements we'll populate.
 */
function cacheDom() {
  els = {
    // Version badge (hero)
    versionBadge:    document.getElementById('version-badge'),
    // Footer version
    footerVersion:   document.getElementById('footer-version'),
    // Release card
    releaseSkeleton: document.getElementById('release-skeleton'),
    releaseStatus:   document.getElementById('release-status'),
    releaseData:     document.getElementById('release-data'),
    releaseError:    document.getElementById('release-error'),
    releaseErrorText:document.getElementById('release-error-text'),
    releaseVersion:  document.getElementById('release-version'),
    releaseDate:     document.getElementById('release-date'),
    releaseSize:     document.getElementById('release-size'),
    releaseDownloads:document.getElementById('release-downloads'),
    // SHA-256
    hashBlock:       document.getElementById('hash-block'),
    hashValue:       document.getElementById('hash-value'),
    hashCopyBtn:     document.getElementById('hash-copy-btn'),
    // Download CTAs
    downloadCta:     document.getElementById('download-cta'),
    releaseDownloadCta: document.getElementById('release-download-cta'),
    // Aria live region
    ariaLive:        document.getElementById('aria-live'),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  FORMATTING HELPERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Format bytes to human-readable MB string.
 * @param {number} bytes
 * @returns {string} e.g. "14.2 MB"
 */
function formatSize(bytes) {
  if (!bytes || typeof bytes !== 'number') return '—';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

/**
 * Format ISO date string to human-readable date.
 * @param {string} isoDate
 * @returns {string} e.g. "March 15, 2026"
 */
function formatDate(isoDate) {
  if (!isoDate) return '—';
  try {
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Format download count with commas, or X.XM for >= 1M.
 * @param {number} count
 * @returns {string}
 */
function formatCount(count) {
  if (typeof count !== 'number' || count < 0) return '—';
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  return count.toLocaleString('en-US');
}

/**
 * Truncate a hash for display: first8…last8.
 * @param {string} hash - 64-character hex string
 * @returns {string}
 */
function truncateHash(hash) {
  if (!hash || hash.length < 16) return hash || '';
  return `${hash.slice(0, 8)}…${hash.slice(-8)}`;
}

// ══════════════════════════════════════════════════════════════════════════════
//  SKELETON STATE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Show the loading skeleton state.
 * Called by orchestrator before API fetch begins.
 */
export function showReleaseSkeleton() {
  cacheDom();

  // Show skeleton and status
  if (els.releaseSkeleton) els.releaseSkeleton.removeAttribute('hidden');
  if (els.releaseStatus)   els.releaseStatus.removeAttribute('hidden');

  // Update CTA to loading state
  if (els.downloadCta) {
    els.downloadCta.textContent = 'Fetching latest…';
    els.downloadCta.setAttribute('aria-busy', 'true');
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  SUCCESS STATE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Populate release card with API data.
 * @param {object} latest - Enriched latest release from api.js
 */
function populateSuccess(latest) {
  const tag = latest.tag_name || '—';
  const date = formatDate(latest.published_at);
  const apk = latest._apk;
  const hash = latest._hash;
  const downloads = latest._downloads;

  // ── 1. Version truth ──────────────────────────────────────────────────────
  // Version badge (hero)
  if (els.versionBadge) {
    els.versionBadge.textContent = tag;
  }

  // Footer version
  if (els.footerVersion) {
    els.footerVersion.textContent = tag;
  }

  // Release card version
  if (els.releaseVersion) {
    els.releaseVersion.textContent = tag;
  }

  // Release date
  if (els.releaseDate) {
    els.releaseDate.textContent = date;
  }

  // ── 2. Download truth ─────────────────────────────────────────────────────
  if (apk) {
    // File size
    if (els.releaseSize) {
      els.releaseSize.textContent = formatSize(apk.size);
    }

    // Download count
    if (els.releaseDownloads) {
      els.releaseDownloads.textContent = formatCount(downloads);
    }

    // Update hero CTA — ready state
    if (els.downloadCta) {
      els.downloadCta.textContent = `Download ${tag} (${formatSize(apk.size)})`;
      els.downloadCta.setAttribute('href', apk.browser_download_url);
      els.downloadCta.setAttribute('download', apk.name);
      els.downloadCta.removeAttribute('aria-busy');
    }

    // Update release card CTA
    if (els.releaseDownloadCta) {
      els.releaseDownloadCta.textContent = `Download ${tag} (${formatSize(apk.size)})`;
      els.releaseDownloadCta.setAttribute('href', apk.browser_download_url);
      els.releaseDownloadCta.setAttribute('download', apk.name);
    }
  } else {
    // No APK asset — show info but disable download
    if (els.releaseSize) {
      els.releaseSize.textContent = '—';
    }
    if (els.releaseDownloads) {
      els.releaseDownloads.textContent = formatCount(downloads);
    }
    if (els.downloadCta) {
      els.downloadCta.textContent = 'APK not available in this release';
      els.downloadCta.removeAttribute('aria-busy');
      // Keep fallback link to GitHub Releases
    }
    if (els.releaseDownloadCta) {
      els.releaseDownloadCta.textContent = 'APK not available in this release';
    }
  }

  // ── 3. Checksum truth ─────────────────────────────────────────────────────
  if (hash && els.hashBlock) {
    els.hashBlock.removeAttribute('hidden');

    if (els.hashValue) {
      els.hashValue.textContent = truncateHash(hash);
      els.hashValue.setAttribute('data-full-hash', hash);
    }

    // Wire copy button
    if (els.hashCopyBtn) {
      els.hashCopyBtn.addEventListener('click', () => copyHash(hash));
    }
  }
  // If no hash, hashBlock stays hidden (default)

  // ── Show data, hide skeleton ──────────────────────────────────────────────
  if (els.releaseSkeleton) els.releaseSkeleton.setAttribute('hidden', '');
  if (els.releaseStatus)   els.releaseStatus.setAttribute('hidden', '');
  if (els.releaseData)     els.releaseData.removeAttribute('hidden');

  // Announce to screen readers via global live region
  if (els.ariaLive) {
    const tag = latest.tag_name || '';
    els.ariaLive.textContent = `Release data loaded: ${tag}`;
    setTimeout(() => {
      if (els.ariaLive) els.ariaLive.textContent = '';
    }, 3000);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  COPY HASH
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Copy SHA-256 hash to clipboard.
 * @param {string} hash - Full 64-character hash
 */
async function copyHash(hash) {
  if (!els.hashCopyBtn) return;

  // Check clipboard API availability
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    showCopyFeedback('Copy failed — select manually', 3000);
    return;
  }

  try {
    await navigator.clipboard.writeText(hash);
    showCopyFeedback('Copied ✓', 2000);

    // Announce to screen readers
    if (els.ariaLive) {
      els.ariaLive.textContent = 'Hash copied to clipboard';
      // Clear after announcement
      setTimeout(() => {
        if (els.ariaLive) els.ariaLive.textContent = '';
      }, 3000);
    }

    console.log('[forge] SHA-256 hash copied to clipboard.');
  } catch {
    showCopyFeedback('Copy failed — select manually', 3000);
    console.warn('[forge] Clipboard write failed.');
  }
}

/**
 * Show temporary feedback text on the copy button.
 * @param {string} text - Feedback message
 * @param {number} duration - Duration in ms before reverting
 */
function showCopyFeedback(text, duration) {
  if (!els.hashCopyBtn) return;

  const original = 'Copy';
  els.hashCopyBtn.textContent = text;
  els.hashCopyBtn.disabled = true;

  setTimeout(() => {
    if (els.hashCopyBtn) {
      els.hashCopyBtn.textContent = original;
      els.hashCopyBtn.disabled = false;
    }
  }, duration);
}

// ══════════════════════════════════════════════════════════════════════════════
//  ERROR STATE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Show error state on release card.
 * @param {Error} error - Typed error with .code property
 */
function populateError(error) {
  const code = error && error.code ? error.code : 'NETWORK';
  const message = ERROR_MESSAGES[code] || ERROR_MESSAGES.NETWORK;

  // Hide skeleton
  if (els.releaseSkeleton) els.releaseSkeleton.setAttribute('hidden', '');
  if (els.releaseStatus)   els.releaseStatus.setAttribute('hidden', '');
  if (els.releaseData)     els.releaseData.setAttribute('hidden', '');

  // Show error
  if (els.releaseError) {
    els.releaseError.removeAttribute('hidden');
  }
  if (els.releaseErrorText) {
    els.releaseErrorText.textContent = message;

    // Append GitHub link
    const link = document.createElement('a');
    link.textContent = 'View releases on GitHub →';
    const ownerEl = document.querySelector('meta[name="forge:repo-owner"]');
    const repoEl  = document.querySelector('meta[name="forge:repo-name"]');
    const owner = ownerEl ? ownerEl.getAttribute('content') : '{OWNER}';
    const repo  = repoEl  ? repoEl.getAttribute('content')  : '{REPO}';
    link.setAttribute('href', `https://github.com/${owner}/${repo}/releases`);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.className = 'terminal-message-link';

    els.releaseErrorText.appendChild(link);
  }

  // CTA → fallback state
  if (els.downloadCta) {
    els.downloadCta.textContent = 'Download from GitHub →';
    els.downloadCta.removeAttribute('aria-busy');
    // href stays as the static fallback (GitHub Releases page)
  }

  // Version badge → static fallback
  if (els.versionBadge) {
    els.versionBadge.textContent = 'Latest Release';
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  PUBLIC API
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Populate the release card and download CTA.
 * Called by orchestrator with API data or error.
 *
 * @param {object|null} latest - Enriched latest release, or null on error
 * @param {Error|null}  error  - Typed error, or null on success
 */
export function populateRelease(latest, error) {
  cacheDom();

  if (error || !latest) {
    populateError(error);
    return;
  }

  populateSuccess(latest);
}
