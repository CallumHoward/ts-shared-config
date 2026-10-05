import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { OxlintConfig } from "oxlint";

const require = createRequire(import.meta.url);

const oxlintBinary = path.join(
  path.dirname(require.resolve("oxlint/package.json")),
  "bin/oxlint",
);

interface OxlintJsonReport {
  diagnostics: Array<{ code: string; filename: string }>;
}

/**
 * Lint fixture files in a throwaway directory with the given config and return
 * the rule ids oxlint reported per file, as `plugin/rule`. Runs the real
 * binary, so it proves a bundled jsPlugin loads and executes, which inspecting
 * the config object cannot.
 */
export function lintFixturesByFile(
  config: OxlintConfig,
  files: Record<string, string>,
): Record<string, string[]> {
  const directory = mkdtempSync(path.join(tmpdir(), "oxlint-fixtures-"));
  try {
    writeFileSync(
      path.join(directory, ".oxlintrc.json"),
      JSON.stringify(config),
    );
    for (const [name, source] of Object.entries(files)) {
      const file = path.join(directory, name);
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, source);
    }
    let stdout: string;
    try {
      stdout = execFileSync(
        oxlintBinary,
        ["-c", ".oxlintrc.json", "--format", "json", "."],
        { cwd: directory, encoding: "utf8" },
      );
    } catch (error: unknown) {
      // oxlint exits non-zero once it reports an error-severity diagnostic.
      stdout = (error as { stdout?: string }).stdout ?? "";
    }
    const report = JSON.parse(stdout) as OxlintJsonReport;
    const byFile = Object.fromEntries(
      Object.keys(files).map((name): [string, string[]] => [name, []]),
    );
    const root = realpathSync(directory);
    for (const { code, filename } of report.diagnostics) {
      // JetBrains terminals (TERMINAL_EMULATOR) switch oxlint to file:// URLs.
      const file = filename.startsWith("file://")
        ? fileURLToPath(filename)
        : path.resolve(root, filename);
      const name = path
        .relative(root, realpathSync(file))
        .split(path.sep)
        .join("/");
      // oxlint's JSON reporter writes codes as `plugin(rule)`.
      (byFile[name] ??= []).push(code.replace(/^(.+)\((.+)\)$/, "$1/$2"));
    }
    return byFile;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}
