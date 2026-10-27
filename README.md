# Zyberlane Design Reference Library

An internal design-study and website-reference catalogue maintained for **Zyberlane** and Dilux.

**Live library:** https://zyberlane-design-library.vercel.app

> The hosted library may require Vercel Authentication. The public GitHub repository and the protected hosted interface have different access boundaries.

## Overview

This project is a standalone reference and selection tool for studying permitted website designs, layouts and implementation patterns. It is **not** the Zyberlane production website, not a client project, and not a claim that the referenced designs were created by Zyberlane.

Referenced work belongs to **Gireesh Kumar Reddy and the respective credited creators/rightsholders**. The library exists to organize authorized design references and centralized previews for study and future independent implementation work.

## Live Site and Deployment

- **Vercel:** https://zyberlane-design-library.vercel.app
- **Hosting model:** one gallery repository and one Vercel project
- **Runtime/build:** Node.js 24
- **Database:** none
- **Runtime secrets:** none required by the gallery itself

The hosted library uses Vercel Authentication for deployment access. `noindex` is an indexing hint only and is not treated as access control.

## Run and Verify

```bash
npm test
npm run build
```

For local development:

```bash
npm run dev
```

The project builds the catalogue and centralized static previews from the maintained source inventory.

## Catalogue Architecture

- `data/catalogue.json` — accepted references and source inventory
- `data/reference-registry.json` — permanent reference IDs; append only, never renumber or reuse
- `data/preview-manifest.json` — mirrored text paths and source pins
- `data/preview-snapshots.json` — immutable source restoration metadata and Git blob checksums
- `encoded-assets/` — exact encoded screenshot/font bytes used for transport and checksum verification
- `docs/preview-compatibility.json` — documented compatibility changes for centralized previews
- `docs/build-results.json` — recorded build results for additional frontend references
- `public/previews/` — committed centralized preview output where applicable

The maintained library currently inventories 63 repositories. Fifty-four contain a website implementation, including variants and redirects. Forty-nine repository implementations are accepted; six distinct landing-concept sites receive separate IDs, producing 54 catalogue entries.

README-only claims are not treated as complete website implementations. Source classification and visual-preview status are tracked separately.

## Library Features

The interface supports:

- Search and category filtering
- Preview-status filtering
- Sorting
- Browser-local saved references
- Source and preview links
- Permanent reference IDs
- Details and source metadata
- Copyable project/reference briefs
- Inventory views for excluded references and reasons

The October 27 catalogue records 33 working and 21 partial previews, with no unavailable entries retained in the maintained library. Framework-generated previews remain marked **Partial** until browser rendering and hosted asset delivery are visually verified.

## Framework Preview Expansion

Framework-only references can be prebuilt from immutable creator commits in GitHub Actions. Generated static runtime files are committed under `public/previews/REF-NNN/` and served by the existing Vercel project; additional Vercel projects are not created for individual references.

Original public media can remain in the creator repository and be requested through commit-pinned fallback rewrites. Build processes use sanitized environments and dependency-install safeguards. A successful build alone does not prove visual equivalence.

## Preview and Source Integrity

Compatible static sites and selected verified frontend builds are served under centralized `/previews/REF-NNN/` routes.

The build restores original static source files from immutable public commits and verifies source checksums. Local HTML, CSS and JavaScript changes are limited to documented compatibility adjustments such as path/base handling.

Do not:

- Run a reference creator's deployment scripts
- Import their `.env` files
- Activate contact, commerce or production integrations
- Push changes to creator repositories
- Present reference work as Zyberlane client work
- Replace a reference with a client identity inside this library

## Permission, Credits and Rights

The owner states that permission was obtained for this design-reference workflow. That permission does **not** establish a blanket license for every third-party font, image, video, trademark, dependency or other protected asset present in referenced projects.

- Referenced project designs and source remain credited to their respective creators/rightsholders.
- Third-party dependencies and assets retain their original licenses and terms.
- Existing notices should be preserved when source material is mirrored or studied.
- The library's catalogue, tooling and organizational layer do not transfer ownership of referenced work to Zyberlane.

The GitHub repository is intentionally public. Do not commit credentials or material that must remain confidential.

## Future Use

Use the library to select a reference, record its source/ID and then create a **new independent project**. Future implementations should preserve appropriate attribution and should not imply that reference designs are original Zyberlane work.

To refresh a reference, inspect the original source read-only, record a new immutable source commit, recheck previews and screenshots, and update the existing reference without changing its permanent ID.

## Copyright and License

No repository-wide license is intended to grant reuse rights over third-party referenced designs or assets.

The library's own project-specific code and catalogue organization remain subject to the repository owner's rights, while referenced code, designs, fonts, media, trademarks and other third-party material remain subject to their respective owners and licenses.
