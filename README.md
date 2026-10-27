# Zyberlane Design Reference Library

An internal website-design selection tool for Dilux. Referenced work belongs to **Gireesh Kumar Reddy and its credited creators**. These projects are design-study references, not Zyberlane client work.

This repository and its `zyberlane-design-library` Vercel project are separate from Zyberlane production, client repositories, and the creator's repositories. No custom production domain is used.

## Run and verify

Requires Node 24 (matching the deployment runtime). The gallery has no npm dependencies, database, runtime secrets, or homemade authentication.

```sh
npm test
npm run build
```

Publish the generated `dist/` using the included `vercel.json`. Managed local preview uses `sites-preview start "$PWD"` with an ignored `.openai/hosting.json` selecting `dist` as `static.directory`.

## Catalogue

- `data/catalogue.json` contains the accepted references and the complete source inventory.
- `data/reference-registry.json` is the permanent ID mapping. **Append IDs; never renumber or reuse them**, including if a reference is removed later.
- `data/preview-manifest.json` records mirrored text paths and their source pins.
- `data/preview-snapshots.json` tells the build which immutable public source files to restore, including their Git blob checksums.
- `encoded-assets/` retains exact screenshot/font bytes in Base64 for connector transport; the build decodes them to ordinary JPEG/font files and verifies SHA-256 checksums. This does not generate, redraw, or alter the screenshots.
- `docs/preview-compatibility.json` documents compatibility changes to centralized static previews.
- `docs/build-results.json` records the two additional original frontend builds.

Discovery on 2026-10-24 found 68 accessible repositories. 59 contain a website implementation, including variants/redirects. 54 repository implementations were accepted; the six distinct landing-concepts sites receive separate IDs, making 59 catalogue entries. README-only claims are not treated as complete sites. Source classification and visual preview status are separate fields.

The gallery supports search, categories, preview-status filters, sorting, browser-local saved references, details, source links, ID copying and a copyable brief for a new independent project. `/inventory` records excluded repositories and reasons. `/reference/ref-014` resolves the permanent ID independently of the current display order.

## Preview architecture

One gallery repository and one Vercel project. Existing creator-hosted URLs are retained only after visual verification. Compatible static sites and two original Vite builds are served below `/previews/REF-NNN/`.

The build restores original static source files from their immutable public commits and verifies Git blob checksums. It uses a local ignored cache when available. Large visual assets stay in the original public repositories. Vercel fallback rewrites request exact pinned commits; no secret, authenticated source access, production database or creator deployment is needed. Local HTML/CSS/JS has only documented URL-prefix/base adjustments. Dependency licenses and source notices remain with the copies. Some source-only entries have no live preview because their required media or runtime is unavailable.

Do not run the creator's deployment scripts, import their `.env` files, activate their contact/commerce integrations, or push to their repositories. Optional Hidden Stories service config is empty in this copy; it uses the original code's demo/keyless fallbacks.

## Privacy and permission

The new Vercel project has Vercel Authentication enabled for **all deployments**. Do not disable protection to test it. The library uses `noindex` as an indexing hint, not as access control. Creator-hosted preview links are outside this protection and retain their own access settings.

The owner's supplied permission covers this design-reference workflow. It does not establish a blanket license to every third-party font, image, video, trademark, or dependency. Preserve existing notices and check project-specific terms for future adaptations.

Repository visibility is controlled in GitHub settings separately from Vercel protection. The connected GitHub interface cannot change it; verify the repository is private if the catalogue/source itself must be confidential.

## Future projects

Select a reference, copy its ID/source link or project brief, then create a **new independent repository**. Never turn this library into a client site, replace a reference with a client identity, or integrate it into zyberlane.com.

To refresh: inspect the original repository read-only, record a new source commit, recheck previews and screenshots, and update that reference without changing its ID. Unavailable previews must retain their actual reason; never substitute a generated image or claim a source-only build is working.
