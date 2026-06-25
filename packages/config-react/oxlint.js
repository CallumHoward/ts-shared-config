// @callumhoward/config-react — oxlint contribution (spike: plain ESM JS)
//
// Each bundled jsPlugin is resolved to an absolute path from *this* package, so
// oxlint can load it from the consumer even though it is not a consumer dep.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const plugin = (name, spec) => ({ name, specifier: require.resolve(spec) });

export default {
  plugins: ["react", "jsx-a11y"],
  jsPlugins: [
    plugin("react-hooks-js", "eslint-plugin-react-hooks"),
    plugin("no-effect", "eslint-plugin-react-you-might-not-need-an-effect"),
    plugin("testing-library", "eslint-plugin-testing-library"),
  ],
  rules: {
    "react/no-array-index-key": "error",
    "react-hooks-js/rules-of-hooks": "error",
  },
};
