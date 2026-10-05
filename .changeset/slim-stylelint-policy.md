---
"@wcmj/config-base": minor
---

Slim the stylelint preset to stylelint-config-standard plus no `!important`, no unknown animations, and no id selectors. Drops the a11y, ordering, nesting, Baseline, logical-property and unknown-custom-property plugins and rules, the nesting-depth, forced-color-adjust and font/grid rules, the `knownCustomProperties` add-on, the `MESSAGES` export, and the postcss `packageExtensions` entries from the pnpm-workspace template.
