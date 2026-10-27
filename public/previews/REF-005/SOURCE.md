# Original reference

Creator: Gireesh Kumar Reddy
Repository: https://github.com/gireeshkumarreddy/Aivinci
Commit: 71da3bd5c831d5ed6afdeafd5eecbc0d4724824f

Centralized authorized design-study preview. This is not a separate deployment or a Zyberlane client project.

- Built the pinned original Vite frontend with a relative base and isolated _preview runtime bundle directory so it can run below the existing /previews/REF-NNN/ host path without colliding with original public assets.
- Removed 81 byte-identical public asset copies from the generated output; the existing host can request those files from the immutable source commit instead.
