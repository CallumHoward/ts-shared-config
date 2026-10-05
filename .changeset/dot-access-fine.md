---
"@wcmj/config-base": patch
---

Drop `noPropertyAccessFromIndexSignature` from the base tsconfig so index-signature properties (e.g. `process.env.CI`) can be read with dot notation
