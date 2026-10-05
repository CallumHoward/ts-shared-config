/** Concatenate an optional-array addon field onto its base field. */
export const concat = <A, T>(
  baseItems: readonly T[],
  addons: readonly A[],
  pick: (addon: A) => T[] | undefined,
): T[] => [...baseItems, ...addons.flatMap((addon) => pick(addon) ?? [])];

/** Merge an optional-record addon field onto its base field, addon-order wins. */
export const merge = <A, T extends object>(
  baseValue: T,
  addons: readonly A[],
  pick: (addon: A) => T | undefined,
): T =>
  Object.assign({}, baseValue, ...addons.map((addon) => pick(addon))) as T;
