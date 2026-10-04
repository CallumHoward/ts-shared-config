/**
 * Shared axe-core configuration for component a11y checks, split by
 * environment. jsdom unit tests consume it via vitest-setup; layout-dependent
 * rules (color-contrast, target-size) can't compute in jsdom and belong to
 * Storybook browser tests, which should reuse this map and re-enable them
 * (addon-a11y takes rules as an array: `Object.entries(axeRules).map(([id,
 * rule]) => ({ id, ...rule }))`).
 */

/**
 * Disabled accessible-name checks: placeholder and title attributes must not
 * count as labels, forcing explicit <label> association.
 */
export const axeChecks = [
  { enabled: false, id: "non-empty-placeholder" },
  { enabled: false, id: "non-empty-title" },
];

export const axeRules: Record<string, { enabled: boolean }> = {
  // jsdom has no canvas, so axe can't compute colors. Storybook browser
  // tests re-enable this (and add target-size, which axe silently skips in
  // jsdom for want of layout — enabling it here would be false confidence).
  "color-contrast": { enabled: false },
  // Components are rendered in isolation, not as a full page, so the
  // page-level landmark best-practice rule does not apply here.
  region: { enabled: false },
  // Experimental structural/semantic rules that compute fine in jsdom.
  "focus-order-semantics": { enabled: true },
  "label-content-name-mismatch": { enabled: true },
  "table-fake-caption": { enabled: true },
  "td-has-header": { enabled: true },
  // Style-dependent trio: near-inert in jsdom (inline styles only), enabled
  // so browser environments sharing this map get their full signal.
  "css-orientation-lock": { enabled: true },
  "hidden-content": { enabled: true },
  "p-as-heading": { enabled: true },
};
