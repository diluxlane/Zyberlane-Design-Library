# Original frontend build

https://github.com/gireeshkumarreddy/streetfighter

Commit: 731f07c2afccc8046081e2f887e06b22ec61f787

- Built the pinned original frontend with its locked dependencies; publicDir:false avoids duplicating original heavy media.
- Set Vite base to ./ and prefixed literal root-relative /media URLs for this reference path.
- Retained dependency license notices. Public media is served from the immutable original commit through a Vercel fallback rewrite.