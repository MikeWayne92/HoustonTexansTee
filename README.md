# Houston Texans “Swarm Tour 2025” Tee — Streetwear Landing Page

A fast, mobile‑first streetwear landing page featuring an interactive 3D t‑shirt viewer, optimized responsive imagery (AVIF/WEBP), and direct checkout CTAs. Built for high performance, clean UX, and quick drops.

- Live site (after enabling Pages): https://mikewayne92.github.io/HoustonTexansTee/
- Buy now: https://mike-wayne-productions.printify.me/product/20598787/houston-texans-swarm-tour-2025-schedule-t-shirt-limited-edition-fan-tee

## Features
- 3D hero viewer (`.glb`) via Google `model-viewer` (orbit/zoom, auto‑rotate)
- Responsive images (AVIF/WEBP/JPG) generated with `sharp`
- Tailwind CSS (CDN) for a sleek, high‑contrast streetwear aesthetic
- Local static server with byte‑range support for `.mp4` and large binaries
- GitHub Pages ready (root redirect + `.nojekyll`)

## Tech Stack
- Tailwind CSS (CDN)
- `@google/model-viewer`
- Node.js 18+
- `sharp` image pipeline (AVIF/WEBP/JPG)
- GitHub Pages

## Quick Start
Install dependencies and build assets:
```bash
npm install
npm run build
```
Run locally:
```bash
npm run dev
# then open http://localhost:5173/landing.html
```
Convenience scripts:
```bash
npm run build:images   # generate AVIF/WEBP/JPG into ./optimized/
npm run build:manifest # write assets.json
npm run build          # run both
```

## Deployment (GitHub Pages)
1) Push to `main`
2) Repo Settings → Pages → Build and deployment
   - Source: Deploy from a branch
   - Branch: `main`, Folder: `/ (root)`
3) Visit: https://mikewayne92.github.io/HoustonTexansTee/

The root `index.html` redirects to `landing.html` for a clean URL.

## Project Structure
- `landing.html` — main landing (3D hero, gallery, videos, CTAs)
- `index.html` — redirect to `landing.html`
- `serve.mjs` — static dev server with range support
- `optimize-images.mjs` — multi‑size AVIF/WEBP/JPG generator
- `build-manifest.mjs` — writes `assets.json`
- `optimized/` — responsive output assets

## SEO & Performance
- Descriptive `<title>` and `<meta name="description">`
- Modern formats (AVIF/WEBP) with JPG fallback and lazy loading
- Minimal blocking resources; CDN Tailwind
- Suggested keywords: streetwear landing page, 3D t‑shirt viewer, responsive images, Tailwind CSS, limited edition tee, Houston Texans fan shirt, Printify checkout, GitHub Pages

## Customize
- Replace source images (`front.png`, `back.png`, `front_graphic.png`, `back_graphic.png`), then `npm run build`
- Swap the 3D model (`shirtmodel.glb`)
- Update CTAs in `landing.html` to your product link

## Legal
© 2025 Mike Wayne Productions — All rights reserved.
