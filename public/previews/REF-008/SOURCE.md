# Original reference

Creator: Gireesh Kumar Reddy
Repository: https://github.com/gireeshkumarreddy/Bahubali
Commit: fd6a72c43356e4d5f443b60c088972f36be4b35f

Centralized authorized design-study preview. This is not a separate deployment or a Zyberlane client project.

- Wrapped the pinned Next.js/Vinext-compatible source with an isolated static-export config using the existing /previews/REF-NNN base path; no source repository was modified.
- Next image optimization is disabled only for this static reference export so original public assets can remain on the pinned source fallback.
- Removed 1292 byte-identical public asset copies from the generated output; the existing host can request those files from the immutable source commit instead.
