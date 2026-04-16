# DEPLOY.md — Forge Distro Site

Deployment and operational documentation for the Forge OTA Lab distribution site.

---

## One-Time Setup

### 1. Create the GitHub Repository

```bash
# Initialize and push
git init
git add -A
git commit -m "Initial site deployment"
git remote add origin https://github.com/{OWNER}/{REPO}-site.git
git push -u origin main
```

### 2. Configure GitHub Pages

1. Go to **Settings → Pages** in the repository.
2. Under **Source**, select **Deploy from a branch**.
3. Select the branch (`main`) and folder (`/ (root)`).
4. Click **Save**.
5. GitHub Pages will build and deploy automatically. The site will be live at:
   ```
   https://{OWNER}.github.io/{REPO}-site/
   ```

> **Note:** If deploying from a `gh-pages` branch instead, push the site files to that branch and select it in Pages settings.

### 3. Set a Custom Domain (Optional)

1. Create a file named `CNAME` in the repo root containing your domain:
   ```
   forge.example.com
   ```
2. Configure your DNS provider:
   - **CNAME record:** `forge.example.com` → `{OWNER}.github.io`
   - Or for apex domains, use **A records** pointing to GitHub's IPs (see [GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site))
3. In **Settings → Pages**, enter the custom domain and check **Enforce HTTPS**.

### 4. Replace Placeholder Values

Before deploying, replace **every** placeholder in the following files. Search for `{OWNER}` and `{REPO}` — they appear in these locations:

| File | Placeholder | Replace With | Count |
|:-----|:------------|:-------------|:-----:|
| `index.html` | `{OWNER}` | Your GitHub username or org | 7 |
| `index.html` | `{REPO}` | Your GitHub repo name (the app repo, not the site repo) | 7 |
| `404.html` | `{OWNER}` | Your GitHub username or org | 5 |
| `404.html` | `{REPO}` | Your GitHub repo name | 5 |
| `robots.txt` | `{OWNER}` | Your GitHub username or org | 1 |
| `robots.txt` | `{REPO}` | Your GitHub repo name | 1 |
| `sitemap.xml` | `{OWNER}` | Your GitHub username or org | 1 |
| `sitemap.xml` | `{REPO}` | Your GitHub repo name | 1 |

**Example:** If your GitHub username is `nicholasmpark` and the app repo is `forge-ota-lab`:

```bash
# Linux/macOS — replace in all files at once
sed -i 's/{OWNER}/nicholasmpark/g; s/{REPO}/forge-ota-lab/g' index.html 404.html robots.txt sitemap.xml
```

```powershell
# Windows PowerShell
$files = @('index.html', '404.html', 'robots.txt', 'sitemap.xml')
foreach ($f in $files) {
    (Get-Content $f -Raw) -replace '\{OWNER\}','nicholasmpark' -replace '\{REPO\}','forge-ota-lab' | Set-Content $f
}
```

**Also update:**
- `index.html` line 20: canonical URL → your actual site URL
- `index.html` line 27: `og:url` → your actual site URL
- `index.html` line 55: `downloadUrl` in JSON-LD → your actual releases URL

### 5. Update the OG Image Path (If Using a Subdirectory)

The `og:image` and `twitter:image` meta tags use a relative path (`og-image.png`). If your site is at a subdirectory (e.g., `username.github.io/repo-name/`), update to an absolute path:

```html
<meta property="og:image" content="https://{OWNER}.github.io/{REPO}/og-image.png">
<meta name="twitter:image" content="https://{OWNER}.github.io/{REPO}/og-image.png">
```

### 6. Submit Sitemap to Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console/).
2. Add and verify your site property.
3. Navigate to **Sitemaps** → enter `sitemap.xml` → click **Submit**.
4. Use **URL Inspection** to request indexing of your main page.

---

## Publishing a Release

The site automatically fetches the latest release from the GitHub API. For the site to display version info, SHA-256 hash, and a direct download link, you must publish releases in a specific format.

### Step 1: Build the Signed APK

```bash
# Build release APK (your build process may vary)
./gradlew assembleRelease
```

### Step 2: Generate SHA-256

```bash
# Linux/macOS
sha256sum forge-ota-lab-v{VERSION}-release.apk

# macOS alternative
shasum -a 256 forge-ota-lab-v{VERSION}-release.apk

# Windows PowerShell
Get-FileHash forge-ota-lab-v{VERSION}-release.apk -Algorithm SHA256 | Select-Object -ExpandProperty Hash
```

### Step 3: Create the GitHub Release

1. Go to your repo → **Releases** → **Draft a new release**.
2. **Tag:** `v{VERSION}` (e.g., `v1.0.0`)
3. **Title:** `v{VERSION}` or a descriptive title
4. **Body:** Include the SHA-256 hash in **exactly** this format (the site regex parses it):

   ```
   SHA-256: a3f4b1c9d2e8f34a67b91c05e3d72f8b4a1c6e9d0f2b3a4c5d6e7f8a9b0c1d2
   ```

   > **Critical:** The format must be `SHA-256: ` followed by exactly 64 hexadecimal characters. No extra spaces, no line breaks within the hash. If this format is wrong, the hash will not appear on the site (it will be silently hidden, not shown as broken).

5. **Attach the APK** as a release asset by dragging it into the assets area.
6. Click **Publish release**.

### Step 4: Verify

1. Wait up to 5 minutes (or until any existing session cache expires).
2. Visit your site.
3. Confirm:
   - Version badge shows `v{VERSION} — Latest Release`
   - Download button shows `Download v{VERSION} ({SIZE} MB)`
   - SHA-256 hash is displayed and copyable
   - Clicking download starts the APK download

> **If the site still shows old data:** Open DevTools → Application → Session Storage → delete `forge-release-cache` and `forge-changelog-cache` → reload.

---

## Updating the Site

### Simple Content Changes

1. Edit the files locally.
2. Commit and push to the deploy branch:
   ```bash
   git add -A
   git commit -m "Update: description of change"
   git push
   ```
3. GitHub Pages rebuilds automatically, typically within 60 seconds.
4. Verify the change is live by hard-refreshing (`Ctrl+Shift+R`).

### When You Modify CSS or JS

Update the cache-busting query string to force browsers to fetch the new version:

In `index.html`, update these lines:
```html
<link rel="stylesheet" href="style.css?v=1.0.1">  <!-- was ?v=1.0.0 -->
<script type="module" src="script.js?v=1.0.1"></script>  <!-- was ?v=1.0.0 -->
```

In `404.html`, update:
```html
<link rel="stylesheet" href="style.css?v=1.0.1">  <!-- was ?v=1.0.0 -->
```

> **Why:** GitHub Pages CDN caches files aggressively. Without updating the query string, visitors may see the old CSS/JS until the CDN cache expires (up to 10 minutes).

---

## Rollback

### If a Deployment Breaks the Site

1. **Identify the last known-good commit:**
   ```bash
   git log --oneline -10
   ```

2. **Revert to that commit:**
   ```bash
   # Option A: Revert specific commits (preserves history)
   git revert HEAD~{N}..HEAD --no-edit
   git push

   # Option B: Hard reset (destructive — rewrites history)
   git reset --hard {COMMIT_HASH}
   git push --force-with-lease
   ```

3. **GitHub Pages rebuilds automatically** (typically < 60 seconds).

4. **Verify restoration:**
   - Open the site in an incognito/private window
   - Confirm the broken change is no longer present
   - Check the download CTA still functions

### Emergency: Take Site Offline

If the site is serving harmful content:

1. Go to **Settings → Pages**
2. Change the source branch to a non-existent branch (e.g., `none`)
3. The site goes offline immediately
4. Fix the issue, then re-enable Pages

---

## Monitoring Checklist (Post-Launch)

### Week 1

- [ ] Run Lighthouse audit (mobile, simulated throttling): Performance ≥ 90, Accessibility ≥ 95
- [ ] Test OG preview on [Twitter Card Validator](https://cards-dev.twitter.com/validator) and [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [ ] Check Google Search Console for crawl errors
- [ ] Verify the download CTA works end-to-end (click → APK downloads)
- [ ] Test on Chrome, Firefox, Safari, Edge (latest versions)

### Week 2

- [ ] Check Google Search Console for indexing status (expect ≥ 1 indexed page)
- [ ] Review GitHub Releases download counts (available via GitHub API or repo insights)
- [ ] Verify site with JavaScript disabled — all static fallbacks present

### Week 4

- [ ] Run second Lighthouse audit — compare with Week 1 baseline
- [ ] Review Search Console impressions and click-through rate
- [ ] Check for any new browser compatibility issues (updated browser versions)
- [ ] Verify the SHA-256 hash display for the latest release

---

## File Inventory

| File | Purpose | Size Budget |
|:-----|:--------|:------------|
| `index.html` | Main page — semantic HTML5, all 7 sections | ≤ 30 KB |
| `style.css` | Styles — OKLCH tokens, layout, responsive, adaptive modes | ≤ 25 KB |
| `script.js` | GitHub API, clipboard, animations, typewriter | ≤ 20 KB |
| `404.html` | Branded error page | — |
| `og-image.png` | Social card (1200×630) | < 300 KB |
| `favicon.ico` | Browser tab icon | < 1 KB |
| `favicon.svg` | Modern SVG favicon | < 1 KB |
| `apple-touch-icon.png` | iOS bookmark icon | < 5 KB |
| `site.webmanifest` | PWA metadata | < 1 KB |
| `robots.txt` | Crawler directives | < 1 KB |
| `sitemap.xml` | Single-URL sitemap | < 1 KB |
| `.nojekyll` | Prevents Jekyll processing | 1 byte |

**Total transfer (excluding OG image):** ≤ 500 KB

---

## SHA-256 Convention Reference

The site parses the release body using this regex:
```
/SHA-256:\s+([a-fA-F0-9]{64})/
```

### Valid Formats (hash will display):
```
SHA-256: a3f4b1c9d2e8f34a67b91c05e3d72f8b4a1c6e9d0f2b3a4c5d6e7f8a9b0c1d2
```

### Invalid Formats (hash will NOT display):
```
sha256: a3f4b1c9...   ← lowercase "sha256" won't match
SHA-256:a3f4b1c9...    ← no space after colon
SHA256: a3f4b1c9...    ← missing hyphen
SHA-256: a3f4b1c9      ← hash too short (not 64 chars)
```

### Troubleshooting

If the hash doesn't appear on the site:
1. Check the release body on GitHub — is the `SHA-256: ` line present?
2. Is there exactly one space after the colon?
3. Is the hash exactly 64 hexadecimal characters?
4. Clear session storage and reload the site.

---

## Architecture Notes

- The site is **fully static** — no server, no database, no build step.
- **GitHub Releases API** is called client-side on page load to fetch the latest version.
- API responses are cached in `sessionStorage` for 5 minutes to avoid rate limits.
- The GitHub API rate limit for unauthenticated requests is **60 requests/hour per IP**.
- The site **degrades gracefully** without JavaScript: all static content is visible, and the download CTA links to the GitHub Releases page.
- All API data is inserted via `textContent` — never `innerHTML` — to prevent XSS.
