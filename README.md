# IVE Cosmic Archive

A responsive, multi-page fan-site prototype built around a futuristic **Cosmic Control Room** concept.

**Live site:** https://ive-cosmic.pages.dev

> Unofficial fan-made project. Not affiliated with IVE, Starship Entertainment, or associated partners.

## Deployment

The production site is deployed through Cloudflare Pages from the `main` branch. Merges into `main` trigger a new production deployment.

## Pages

- `index.html` — landing page and overview
- `members.html` — six interactive member dossiers
- `eras.html` — era timeline and archive coordinate cards
- `media.html` — featured media console and filterable vault
- `dive-zone.html` — song picker, era quiz, bias card, and prototype fan signals

## Features

- Dark cosmic visual system with responsive layouts
- Shared navigation and motion controls across every page
- Officially credited REVIVE+ member portraits
- Member dossier selector with signature-era scan
- REVIVE+ album archive and official media embed
- Selectable era timeline and archive cards
- Filterable media-vault interface
- Random song picker, era quiz, and bias access-card generator
- Reduced-motion support and semantic navigation

## Run locally

No build process is required. Open `index.html` directly, or serve the folder with any static file server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Project structure

```text
ive-cosmic-archive/
├── index.html
├── members.html
├── eras.html
├── media.html
├── dive-zone.html
├── styles.css
├── pages.css
├── script.js
├── _headers
└── README.md
```

## Next development phase

Replace the remaining media placeholders with credited official embeds, then continue expanding structured album, track, member, and fan-tool content.
