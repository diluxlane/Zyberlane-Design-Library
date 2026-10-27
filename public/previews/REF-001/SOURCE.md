# Original reference

Creator: Gireesh Kumar Reddy
Repository: https://github.com/gireeshkumarreddy/-Gireesh-Portfolio
Commit: 4133a153bd3c29894ee3794097ee6434c90107cc

Centralized authorized design-study preview. This is not a separate deployment or a Zyberlane client project.

- Marked 2 robots/sitemap metadata route(s) force-static inside the isolated export workspace so Next.js can statically export metadata endpoints; the creator repository is unchanged.
- Wrapped the pinned Next.js source with an isolated static-export config using the existing /previews/REF-NNN base path; no separate deployment was created.
- Kept the small original public asset set inside this preview output rather than introducing another hosting project or runtime dependency.
