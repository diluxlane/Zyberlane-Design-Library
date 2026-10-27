# Architecture and inspection record

The source inventory is static data. The application uses HTML, CSS and vanilla JavaScript ES modules; Node's built-in APIs build the static output and test catalogue behavior. Filtering runs in the browser, with no server-side data store. Saved references stay in the current browser.

## Separation boundaries

| Item | Target | Access in this task |
| --- | --- | --- |
| Original references | gireeshkumarreddy repositories | Read-only inspection and public immutable asset fetches |
| Reference library | diluxlane/Zyberlane-Design-Library | Sole source-write repository |
| Library deployment | zyberlane-design-library / diluxln | Sole Vercel project created/updated |
| Zyberlane production and clients | Existing repositories, domains, databases and deployments | Out of scope; no mutations |
| Future adaptations | New independent repositories | Not created by this task |

## Discovery method

Enumerated owner repositories with pagination and cross-checked GitHub repository search including forks. Read complete accessible Git trees, repository metadata, manifests, entry points, styles, documentation and relevant components. The inspected default-branch commit is stored per entry. No fixed repository count was assumed.

Classifications A–G describe available source, not live status. A source can be complete while its creator's deployment returns HTTP 402. Conversely, a working visual prototype can still simulate booking, payments or accounts. Notes preserve those limits.

The six landing-concepts routes represent separate design choices. Exact/near-exact duplicate repositories stay in the inventory with their canonical reference instead of creating redundant cards. Empty, setup-only and README-only repositories remain inspectable in the inventory.

## Preview delivery

Existing deployments are checked for HTTP response and actual rendered identity. Local snapshots keep source typography, imagery, motion, and interactions; compatibility changes are limited to path resolution and the two documented Vite build settings. The gallery never embeds creator code in its own UI components.

Vercel's filesystem serves local preview code. Missing large assets fall back to raw.githubusercontent.com at the recorded commit. If the original public repository or asset becomes unavailable, the reference must be reclassified; do not silently replace it. This choice avoids committing gigabytes of media or creating dozens of permanent hosting projects.

Preview code is reference material. Do not supply real account/payment/contact information or activate a backend while browsing. No production integrations or reference credentials were copied into the library. The library itself has no runtime credentials to disclose to preview scripts.

## Verification scope

Catalogue tests cover ID uniqueness/stability, inventory completeness, repository URL mapping, composed filters, search, sorting, copied project identity and screenshot/status invariants. Browser QA covers the gallery, direct detail routes, ID copy, categories, empty state and a 390-pixel iframe viewport. Reference previews receive individual screenshot/status evidence; they are not audited as production commerce or booking systems.

Vercel Authentication must remain enabled for all environments. Repository visibility is a separate GitHub setting. No custom domains, production DNS or existing project environment variables are needed.

## Preview compatibility verification

The build restores 253 immutable source text files across 14 static snapshots, in addition to two original Vite builds. URL adaptation preserves JavaScript regex literals and SVG syntax; root-fragment links stay within the corresponding reference. No design logic was replaced.

`npm run dev` serves the built output for local QA and mirrors the exact pinned asset rewrites. The internal QA environment may require staging the same public asset bytes locally when its streaming proxy cannot reach them. These media are QA-only; the deployed architecture still uses immutable rewrites.

The October 25 deployed visual inspection was followed by an October 27 recovery check after workspace maintenance. Vercel Authentication remained enabled; the later anonymous browser correctly reached sign-in. An authenticated post-update browser check must be recorded separately from local QA and build success.

The October 27 local check covered all 16 previously browser-checked central previews, retaining original source behavior when WebGL was unavailable. It records 12 working openings and four partial previews; the two unavailable references were removed from the maintained library. Fifteen representative screenshots are stored with verified checksums; loading screens and missing-photo layouts are not used as gallery thumbnails. The retained catalogue totals are 33 working and 21 partial previews; unavailable references are not retained. The structured record is `preview-verification-2026-10-27.json`.

The owner has explicitly chosen to keep this GitHub repository public and authorized pushing the reference catalogue and captures. Repository privacy is not a pending task. The hosted library retains its independent authentication. Releases use the existing GitHub-to-Vercel connection: push a reviewed commit or pull request and let the connected integration build it. Do not upload or deploy directly through Vercel, change its settings, or create a public share link for verification.
