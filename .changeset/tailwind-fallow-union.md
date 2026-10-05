---
"@wcmj/config-tailwind": patch
"@wcmj/config-base": patch
"@wcmj/config-react": patch
"@wcmj/config-tanstack": patch
"@wcmj/config-playwright": patch
"@wcmj/config-gha": patch
---

Make the tailwind fallow preset carry config-react's `ignoreDependencies`, since extending several presets keeps only the last one's list.
