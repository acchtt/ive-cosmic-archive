# IVE Cosmic Archive — Agent Development Rules

These instructions are mandatory for any future ChatGPT/agent session modifying this repository.

## Production versioning and cache busting

For every production-facing UI, mobile, CSS, JavaScript, or asset-loader change:

1. **Always assign a new version number.** Never reuse the previous production version token. Increment the numeric suffix monotonically (for example `...-v15` → `...-v16`).
2. **Always cache-bust the top-level loader reference as well as its dynamically loaded assets.** On Home/mobile work this means the version in `index.html` for `album-theme-sync.js?v=...` must match `MOBILE_ASSET_VERSION` in `album-theme-sync.js`. Any CSS/JS files loaded by that script must inherit that same version token.
3. **Never finish a production change with mismatched version tokens.** Before reporting completion, verify the HTML loader query string and the loader's internal version constant are identical.
4. **Always provide a cache-busted production URL after the change.** Use the live site with the new version token as a query parameter, e.g. `https://ive-cosmic.pages.dev/?v=<NEW_VERSION>`.
5. **Auto-open/visit the cache-busted production URL immediately after deployment whenever browsing/open-URL capability is available.** Do this without asking for another confirmation, and use the fresh URL for verification rather than the unversioned production URL.
6. **Always state the new version number in the completion message.** The completion message must include both `Version: <NEW_VERSION>` and the cache-busted live link.

## Mobile-specific rule

For mobile development, version/cache-bust handling is part of the change itself, not an optional cleanup step. A mobile task is not complete until the version is bumped, the top-level script URL is cache-busted, the matching mobile assets use the same token, and the fresh production link has been opened/checked when tooling permits.

## Current production convention

The existing mobile loader uses string tokens such as `mobile-stage-names-v15`. Preserve the descriptive prefix when useful, but always increase the final numeric version for each production change.
