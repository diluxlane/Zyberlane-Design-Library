# Original frontend build

https://github.com/gireeshkumarreddy/Portfolio2

Commit: 5ea19735f09187577eb050c493a7a4a989cbcdfd

- Built the pinned original frontend with its locked dependencies; publicDir:false avoids duplicating original heavy media.
- Set Vite base to ./ and prefixed literal root-relative /images URLs for this reference path.
- Retained dependency license notices. Public media is served from the immutable original commit through a Vercel fallback rewrite.