# Original reference

Creator: Gireesh Kumar Reddy
Repository: https://github.com/gireeshkumarreddy/HABU-
Commit: 6e4254a96dc6b0648765ddd1e8099f875b1a1f8a

Centralized authorized design-study preview. This is not a separate deployment or a Zyberlane client project.

- Wrapped the pinned Next.js/Vinext-compatible source with an isolated static-export config using the existing /previews/REF-NNN base path; no source repository was modified.
- Next image optimization is disabled only for this static reference export so original public assets can remain on the pinned source fallback.
- Removed 8 byte-identical public asset copies from the generated output; the existing host can request those files from the immutable source commit instead.
