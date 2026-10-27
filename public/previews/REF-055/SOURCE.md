# Original reference

Creator: Gireesh Kumar Reddy
Repository: https://github.com/gireeshkumarreddy/velora
Commit: c73f218c9ce74d96610f196e5bd60ee5604ddd58

Centralized authorized design-study preview. This is not a separate deployment or a Zyberlane client project.

- Wrapped the pinned Next.js/Vinext-compatible source with an isolated static-export config using the existing /previews/REF-NNN base path; no source repository was modified.
- Next image optimization is disabled only for this static reference export so original public assets can remain on the pinned source fallback.
- Removed 11 byte-identical public asset copies from the generated output; the existing host can request those files from the immutable source commit instead.
