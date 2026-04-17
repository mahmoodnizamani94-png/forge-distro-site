// ══════════════════════════════════════════════════════════════════════════════
// FORGE DISTRO v2 — Changelog Accordion Module
// ═══════════════════════════════════════════════════════════════════════════════
// Builds an accessible exclusive accordion from up to 3 GitHub releases.
//
// Features:
//   - Markdown stripped via regex (no library)
//   - Exclusive accordion (one entry expanded at a time)
//   - First entry pre-expanded on load
//   - Full keyboard support: Enter/Space toggle, ArrowUp/ArrowDown navigate
//   - Correct ARIA: aria-expanded, aria-controls, role="region", aria-labelledby
//   - Error fallback with GitHub link
//   - All elements created via document.createElement + textContent
//
// CSS class names align with the existing design system:
//   .changelog-entry, .changelog-entry-header, .changelog-entry-version,
//   .changelog-entry-date, .changelog-entry-toggle, .changelog-entry-content,
//   .changelog-entry-content-inner, .changelog-entry-body
// ══════════════════════════════════════════════════════════════════════════════

// ── DOM references ─────────────────────────────────────────────────────────────
let changelogEntries  = null;
let changelogSkeleton = null;
let changelogStatus   = null;
let changelogError    = null;

// ── State ──────────────────────────────────────────────────────────────────────
let triggers = []; // accordion trigger buttons for keyboard navigation

// ══════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Strip markdown formatting from text.
 * Handles: headers (#), bold and italic markers, inline code (`),
 * strikethrough (~), links [text](url), images ![alt](url), blockquotes (>),
 * horizontal rules (---), list markers (- and *), numbered lists.
 * @param {string} text - Markdown text
 * @returns {string} Plain text
 */
function stripMarkdown(text) {
  if (!text) return '';
  return text
    // Remove images: ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Convert links: [text](url) → text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Remove headers: ## Header → Header
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic markers: **text**, __text__, *text*, _text_
    .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, '$2')
    // Remove inline code: `code`
    .replace(/`([^`]+)`/g, '$1')
    // Remove strikethrough: ~~text~~
    .replace(/~~(.*?)~~/g, '$1')
    // Remove blockquotes: > text → text
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules: --- or ***
    .replace(/^[-*]{3,}\s*$/gm, '')
    // Remove unordered list markers: - item or * item
    .replace(/^[\s]*[-*]\s+/gm, '• ')
    // Remove ordered list markers: 1. item
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Format ISO date string to short format.
 * @param {string} isoDate
 * @returns {string} e.g. "Mar 15, 2026"
 */
function formatDate(isoDate) {
  if (!isoDate) return '';
  try {
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  ACCORDION BEHAVIOR
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Toggle an accordion entry. Exclusive: closes all others.
 * @param {HTMLButtonElement} trigger - The trigger button that was activated
 * @param {HTMLElement} entry - The parent .changelog-entry container
 */
function toggleEntry(trigger, entry) {
  const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
  const panelId = trigger.getAttribute('aria-controls');
  const panel = document.getElementById(panelId);

  if (!panel) return;

  // Close all others (exclusive accordion)
  triggers.forEach((t) => {
    if (t.trigger !== trigger) {
      t.trigger.setAttribute('aria-expanded', 'false');
      t.entry.setAttribute('aria-expanded', 'false');
    }
  });

  // Toggle this one
  if (isExpanded) {
    trigger.setAttribute('aria-expanded', 'false');
    entry.setAttribute('aria-expanded', 'false');
  } else {
    trigger.setAttribute('aria-expanded', 'true');
    entry.setAttribute('aria-expanded', 'true');
  }
}

/**
 * Handle keyboard navigation between triggers.
 * @param {KeyboardEvent} e
 */
function handleKeydown(e) {
  const currentIndex = triggers.findIndex(t => t.trigger === e.currentTarget);
  if (currentIndex === -1) return;

  let nextIndex = -1;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      nextIndex = (currentIndex + 1) % triggers.length;
      break;
    case 'ArrowUp':
      e.preventDefault();
      nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      toggleEntry(triggers[currentIndex].trigger, triggers[currentIndex].entry);
      return;
    default:
      return;
  }

  if (nextIndex >= 0) {
    triggers[nextIndex].trigger.focus();
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  BUILD ACCORDION
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Build the accordion DOM from releases data.
 * Uses class names matching the existing CSS design system.
 * @param {Array} releases - Array of enriched release objects from api.js
 */
function buildAccordion(releases) {
  if (!changelogEntries) return;

  // Clear any existing content (safety)
  while (changelogEntries.firstChild) {
    changelogEntries.removeChild(changelogEntries.firstChild);
  }

  triggers = [];

  releases.forEach((release, index) => {
    const tag = release.tag_name || 'Unknown';
    const date = formatDate(release.published_at);
    const body = release.body ? stripMarkdown(release.body) : 'No changelog provided.';

    // Unique IDs for ARIA
    const triggerId = `changelog-trigger-${index}`;
    const panelId   = `changelog-panel-${index}`;

    // Determine if this entry should be pre-expanded (first one)
    const isExpanded = index === 0;

    // ── .changelog-entry (container) ────────────────────────────────────────
    // CSS uses [aria-expanded] on this element for grid-template-rows transition
    const entry = document.createElement('div');
    entry.className = 'changelog-entry';
    entry.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

    // ── .changelog-entry-header (trigger button) ────────────────────────────
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'changelog-entry-header';
    trigger.id = triggerId;
    trigger.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    trigger.setAttribute('aria-controls', panelId);

    // Version tag
    const versionSpan = document.createElement('span');
    versionSpan.className = 'changelog-entry-version';
    versionSpan.textContent = tag;

    // Date
    const dateSpan = document.createElement('span');
    dateSpan.className = 'changelog-entry-date';
    dateSpan.textContent = date;

    // Toggle indicator (arrow)
    const toggleSpan = document.createElement('span');
    toggleSpan.className = 'changelog-entry-toggle';
    toggleSpan.setAttribute('aria-hidden', 'true');
    toggleSpan.textContent = '▾';

    trigger.appendChild(versionSpan);
    trigger.appendChild(dateSpan);
    trigger.appendChild(toggleSpan);

    // Event listeners
    trigger.addEventListener('click', () => toggleEntry(trigger, entry));
    trigger.addEventListener('keydown', handleKeydown);

    triggers.push({ trigger, entry });

    // ── .changelog-entry-content (animated grid container) ──────────────────
    const content = document.createElement('div');
    content.className = 'changelog-entry-content';
    content.id = panelId;
    content.setAttribute('role', 'region');
    content.setAttribute('aria-labelledby', triggerId);

    // ── .changelog-entry-content-inner (overflow hidden wrapper) ────────────
    const inner = document.createElement('div');
    inner.className = 'changelog-entry-content-inner';

    // ── .changelog-entry-body (the actual text content) ─────────────────────
    const bodyEl = document.createElement('div');
    bodyEl.className = 'changelog-entry-body';

    // Split body into paragraphs for readability
    const paragraphs = body.split(/\n{2,}/);
    const textParts = [];
    paragraphs.forEach((para) => {
      const trimmed = para.trim();
      if (trimmed) textParts.push(trimmed);
    });

    if (textParts.length > 0) {
      bodyEl.textContent = textParts.join('\n\n');
    } else {
      bodyEl.textContent = body;
    }

    // Assemble: inner → content
    inner.appendChild(bodyEl);
    content.appendChild(inner);

    // Assemble: entry
    entry.appendChild(trigger);
    entry.appendChild(content);
    changelogEntries.appendChild(entry);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  SKELETON STATE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Show the changelog loading skeleton.
 */
export function showChangelogSkeleton() {
  changelogSkeleton = document.getElementById('changelog-skeleton');
  changelogStatus   = document.getElementById('changelog-status');

  if (changelogSkeleton) changelogSkeleton.removeAttribute('hidden');
  if (changelogStatus)   changelogStatus.removeAttribute('hidden');
}

// ══════════════════════════════════════════════════════════════════════════════
//  ERROR STATE
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Show the changelog error fallback.
 */
function showError() {
  // Hide skeleton
  if (changelogSkeleton) changelogSkeleton.setAttribute('hidden', '');
  if (changelogStatus)   changelogStatus.setAttribute('hidden', '');
  if (changelogEntries)  changelogEntries.setAttribute('hidden', '');

  // Show error block (already contains GitHub link in HTML)
  if (changelogError) {
    changelogError.removeAttribute('hidden');
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  PUBLIC API
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Populate the changelog accordion.
 * Called by orchestrator with releases array or error.
 *
 * @param {Array|null}  releases - Array of enriched release objects, or null on error
 * @param {Error|null}  error    - Typed error, or null on success
 */
export function populateChangelog(releases, error) {
  changelogEntries  = document.getElementById('changelog-entries');
  changelogSkeleton = document.getElementById('changelog-skeleton');
  changelogStatus   = document.getElementById('changelog-status');
  changelogError    = document.getElementById('changelog-error');

  if (error || !releases || releases.length === 0) {
    showError();
    return;
  }

  // Build the accordion
  buildAccordion(releases);

  // Hide skeleton, show entries
  if (changelogSkeleton) changelogSkeleton.setAttribute('hidden', '');
  if (changelogStatus)   changelogStatus.setAttribute('hidden', '');
  if (changelogEntries)  changelogEntries.removeAttribute('hidden');
}
