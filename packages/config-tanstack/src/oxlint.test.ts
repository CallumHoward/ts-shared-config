import { defineOxlint } from "@wcmj/config-base/oxlint";
import { lintFixturesByFile } from "@wcmj/config-utilities/oxlint-fixtures";
import { beforeAll, describe, expect, it } from "vitest";

import { tanstackQuery, tanstackRouter } from "./oxlint.ts";

const routeFixture = (properties: string) => `
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/posts")({
${properties}
});
`;

describe("tanstack addon rule routing", () => {
  it("should key the router rules under the tanstack-router jsPlugin", () => {
    const keys = Object.keys(tanstackRouter.rules ?? {});
    expect(keys).toContain("tanstack-router/route-param-names");
    expect(keys).toContain("tanstack-router/create-route-property-order");
  });

  it("should allow throwing the router's Redirect", () => {
    expect(tanstackRouter.rules?.["typescript/only-throw-error"]).toEqual([
      "error",
      {
        allow: [
          {
            from: "package",
            name: "Redirect",
            package: "@tanstack/router-core",
          },
        ],
      },
    ]);
  });

  it("should key the query rules under the tanstack-query jsPlugin", () => {
    const keys = Object.keys(tanstackQuery.rules ?? {});
    expect(keys).toContain("tanstack-query/exhaustive-deps");
    expect(keys).toContain("tanstack-query/no-void-query-fn");
  });

  it("should leave no rule under the plugins' own @tanstack namespace", () => {
    const keys = [
      ...Object.keys(tanstackRouter.rules ?? {}),
      ...Object.keys(tanstackQuery.rules ?? {}),
    ];
    expect(keys.filter((key) => key.startsWith("@tanstack/"))).toEqual([]);
  });
});

describe("tanstack addons under oxlint", () => {
  // One oxlint run for every fixture: loading the base jsPlugins dominates.
  let codes: Record<string, string[]>;
  beforeAll(() => {
    codes = lintFixturesByFile(defineOxlint(tanstackRouter, tanstackQuery), {
      "src/routes/misordered.tsx": routeFixture(
        "  loader: () => ({ posts: [] }),\n  beforeLoad: () => ({ user: null }),",
      ),
      "src/routes/ordered.tsx": routeFixture(
        "  beforeLoad: () => ({ user: null }),\n  loader: () => ({ posts: [] }),",
      ),
      "src/use-post.ts": `
import { useQuery } from "@tanstack/react-query";

export function usePost(id: string) {
  return useQuery({ queryKey: ["post"], queryFn: () => fetch(\`/posts/\${id}\`) });
}
`,
    });
  });

  it("should report create-route-property-order on a misordered route", () => {
    expect(codes["src/routes/misordered.tsx"]).toContain(
      "tanstack-router/create-route-property-order",
    );
  });

  it("should stay quiet on a route whose properties are in order", () => {
    expect(codes["src/routes/ordered.tsx"]).not.toContain(
      "tanstack-router/create-route-property-order",
    );
  });

  it("should report exhaustive-deps on a queryKey missing a dependency", () => {
    expect(codes["src/use-post.ts"]).toContain(
      "tanstack-query/exhaustive-deps",
    );
  });
});
