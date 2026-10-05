/**
 * Shared axe-core configuration for component a11y checks. jsdom unit tests
 * consume it via vitest-setup. Layout-dependent rules (color-contrast,
 * target-size) can't be evaluated meaningfully in jsdom, so browser-based a11y
 * tests can reuse this map and enable them. For a tool that takes rules as an
 * array: `Object.entries(axeRules).map(([id, rule]) => ({ id, ...rule }))`.
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
  // jsdom has no canvas, so axe can't compute colors; it reports contrast as
  // incomplete. Browser tests enable this (and target-size, which is off by
  // default and meaningless without layout — a 2x2 button passes in jsdom).
  "color-contrast": { enabled: false },
  // Components are rendered in isolation, not as a full page, so the
  // page-level landmark best-practice rule does not apply here.
  region: { enabled: false },
  // Experimental structural/semantic rules that compute fine in jsdom.
  "focus-order-semantics": { enabled: true },
  "table-fake-caption": { enabled: true },
  "td-has-header": { enabled: true },
  // Layout- or style-dependent: near-inert in jsdom (it reports
  // label-content-name-mismatch as incomplete, never a violation), enabled so
  // browser environments sharing this map get their full signal.
  "css-orientation-lock": { enabled: true },
  "label-content-name-mismatch": { enabled: true },
  "hidden-content": { enabled: true },
  "p-as-heading": { enabled: true },
};
