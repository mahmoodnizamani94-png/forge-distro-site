# Forge Distro Site — Deployment Guide

> Zero build step. Static HTML/CSS/JS served from GitHub Pages.

---

## Prerequisites

- Git installed
- A GitHub account with push access to `mahmoodnizamani-99/forge-distro-site`
- No build tools, bundlers, or package managers required

---

## Deployment

```bash
git add -A && git commit -m "v2.0.0" && git push origin main
```

GitHub Pages rebuilds automatically within ~60 seconds.

**Live URL:** https://mahmoodnizamani-99.github.io/forge-distro-site/

---

## Post-Deployment Verification Checklist

1. **Site loads** — visit the URL, confirm hero heading and CTA render
2. **API data** — version badge, release card, and changelog populate (or show graceful error if no releases yet)
3. **Download CTA** — click works, APK starts downloading (or links to GitHub Releases)
4. **Mobile drawer** — tap hamburger on mobile, drawer opens, links navigate correctly
5. **OG preview** — paste URL into [Twitter Card Validator](https://cards-dev.twitter.com/validator) or [Facebook Debugger](https://developers.facebook.com/tools/debug/) — image and title render

---

## How to Update Release Data

Push a new release to the **app repo** (`mahmoodnizamani-99/forge-ota-lab`). The site auto-fetches the latest release from the GitHub API on every page load (with 5-minute sessionStorage cache).

**Release body format** — include the SHA-256 hash exactly like this:

```
SHA-256: a3f4b1c9d2e8f34a67b91c05e3d72f8b4a1c6e9d0f2b3a4c5d6e7f8a9b0c1d2
```

---

## How to Update Developer Identity

Edit the `forge:dev-*` meta tags in `index.html`:

```html
<meta name="forge:dev-name" content="Your Name">
<meta name="forge:dev-tagline" content="Your tagline">
<meta name="forge:dev-url" content="https://your-site.com">
<meta name="forge:dev-github" content="https://github.com/you">
<meta name="forge:dev-linkedin" content="https://linkedin.com/in/you">
```

---

## Cache-Busting

When modifying CSS or JS, increment the `?v=` query string in both `index.html` and `404.html`:

```html
<link rel="stylesheet" href="css/styles.css?v=2.0.1">
<script type="module" src="js/script.js?v=2.0.1"></script>
```

---

## Rollback

```bash
git revert HEAD && git push
```

For multi-commit rollback:

```bash
git log --oneline -5        # find the last good commit
git revert HEAD~N..HEAD --no-edit
git push
```

---

## Architecture

| File | Purpose |
|:-----|:--------|
| `index.html` | Main page — 11 sections, SEO, structured data |
| `css/styles.css` | Design system — OKLCH tokens, responsive, adaptive modes |
| `js/script.js` | Module orchestrator — imports and boots all JS modules |
| `js/api.js` | GitHub API client — fetch, cache, validate, enrich |
| `js/release.js` | Release card population |
| `js/changelog.js` | Accordion builder |
| `js/stats.js` | Counter animation |
| `js/terminal.js` | Typewriter + interactive terminal |
| `js/animations.js` | Scroll-spy, gallery, built-by, star count, cursor glow |
| `js/drawer.js` | Mobile nav drawer |
| `js/particles.js` | Canvas particle system |
| `404.html` | Branded 404 page |
| `og-image.png` | Social card (1200×630) |
| `site.webmanifest` | PWA metadata |
| `robots.txt` | Crawler directives |
| `sitemap.xml` | Single-URL sitemap |
| `.nojekyll` | Prevents Jekyll processing |
