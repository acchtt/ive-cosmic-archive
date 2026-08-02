# IVE Cosmic Archive

A responsive, multi-page fan site built around a futuristic **Cosmic Control Room** concept.

**Live site:** https://ive-cosmic.pages.dev

> Unofficial fan-made project. Not affiliated with IVE, Starship Entertainment, or associated partners.

## Deployment

The production site is deployed through Cloudflare Pages from the `main` branch. Merges into `main` trigger a new production deployment.

## Pages

- `index.html` — landing page and overview
- `members.html` — six interactive member dossiers
- `eras.html` — era timeline and discography archive
- `media.html` — featured media console, complete M/V rail, and filterable vault
- `dive-zone.html` — song picker, era quiz, bias card, and fan signals
- `admin/` — protected D1-backed media management dashboard

## Media admin setup

The public Media page keeps its built-in catalog as a fallback. After D1 is configured, it reads the live database from `/api/videos`, so admin changes appear without a Git commit or Pages redeploy.

### 1. Create and seed D1

Create a D1 database named `ive-cosmic-media`. Copy `wrangler.example.jsonc` to `wrangler.jsonc`, replace the database ID, then apply the included migration:

```bash
npx wrangler d1 migrations apply ive-cosmic-media --remote
```

The same SQL can also be run from the D1 console using `migrations/0001_media_catalog.sql`.

### 2. Bind D1 to Pages

In the Cloudflare Pages project, open **Settings → Bindings**, add a D1 binding with variable name:

```text
IVE_MEDIA_DB
```

Select the `ive-cosmic-media` database and redeploy the project.

### 3. Protect the admin path

Create a Cloudflare Access self-hosted application for:

```text
ive-cosmic.pages.dev/admin/*
```

Add an Allow policy for the email address or identity group that should manage the site. The dashboard and write API both live below this protected path.

Optionally add a Pages environment variable named `ADMIN_EMAILS` containing a comma-separated allowlist. The API also requires Cloudflare Access authentication headers and will reject unauthenticated writes.

Admin URL:

```text
https://ive-cosmic.pages.dev/admin/
```

## Local development

The static pages can still be served directly:

```bash
python -m http.server 8000
```

To test Pages Functions and D1 locally, configure `wrangler.jsonc` and run:

```bash
npx wrangler pages dev .
```

For local-only admin API testing, set `ADMIN_DEV_BYPASS=true` in `.dev.vars`. Never enable that variable in production.

## Project structure

```text
ive-cosmic-archive/
├── admin/
│   ├── index.html
│   ├── admin.css
│   └── admin.js
├── functions/
│   ├── _lib/video-store.js
│   ├── api/videos.js
│   └── admin/api/videos/
├── migrations/0001_media_catalog.sql
├── index.html
├── members.html
├── eras.html
├── media.html
├── dive-zone.html
├── styles.css
├── pages.css
├── script.js
├── wrangler.example.jsonc
├── _headers
└── README.md
```
