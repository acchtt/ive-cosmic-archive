# IVE Cosmic Archive

A responsive, multi-page fan site built around a futuristic **Cosmic Control Room** concept.

**Live site:** https://ive-cosmic.pages.dev

> Unofficial fan-made project. Not affiliated with IVE, Starship Entertainment, or associated partners.

## Deployment

The production site is deployed through Cloudflare Pages from the `main` branch. Merges into `main` trigger a new production deployment.

After adding or changing a Pages binding or secret, create a fresh production deployment before testing the associated Function. The deployment must be created after all required production secrets have been saved.

## Pages

- `index.html` — landing page and overview
- `members.html` — six interactive member dossiers
- `eras.html` — era timeline and discography archive
- `media.html` — featured media console, complete M/V rail, and filterable vault
- `dive-zone.html` — song picker, era quiz, bias card, and fan signals
- `admin/` — password-protected D1-backed media management dashboard

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

### 3. Add encrypted admin secrets

In **Settings → Variables and Secrets**, add and encrypt:

```text
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
```

Use a strong unique password. `ADMIN_SESSION_SECRET` must be at least 32 characters; a random 64-character value is recommended:

```bash
openssl rand -hex 32
```

The login Function creates an eight-hour signed session stored in a Secure, HttpOnly, SameSite=Strict cookie. Write requests also require the same browser origin.

Admin URL:

```text
https://ive-cosmic.pages.dev/admin/
```

### Optional Cloudflare Access layer

Cloudflare Access public-hostname protection requires a domain in an active Cloudflare zone. After adding a custom domain to the Pages project, you can also protect `/admin/*` with Access. Set `ADMIN_ACCESS_ENABLED=true` and optionally set `ADMIN_EMAILS` to a comma-separated allowlist before the API accepts Access-authenticated identities.

## Local development

The static pages can still be served directly:

```bash
python -m http.server 8000
```

To test Pages Functions and D1 locally, configure `wrangler.jsonc`, create `.dev.vars`, and run:

```bash
npx wrangler pages dev .
```

Example `.dev.vars`:

```text
ADMIN_PASSWORD="local-password"
ADMIN_SESSION_SECRET="replace-with-at-least-32-characters"
```

For local-only API testing without login, set `ADMIN_DEV_BYPASS=true`. Never enable that variable in production. Do not commit `.dev.vars` or `.env` files.

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
│   └── admin/api/
│       ├── session.js
│       └── videos/
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
