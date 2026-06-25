# config-base templates

Files that pnpm, lefthook, editors, and CI read but cannot `import`/`extends`
from a package. Copy them into your repo once (re-copy to pick up updates).

| Template | Copy to |
| --- | --- |
| `lefthook.yml` | `lefthook.yml` |
| `pnpm-workspace.yaml` | merge the keys into your `pnpm-workspace.yaml` |
| `editorconfig` | `.editorconfig` |
| `nvmrc` | `.nvmrc` |
| `fallowrc.json` | `.fallowrc.json` |
| `vscode/settings.json` | `.vscode/settings.json` |
| `vscode/extensions.json` | `.vscode/extensions.json` |

The `.vscode` settings follow the Oxc extension's recommended fix/format-on-save
setup (`oxc.oxc-vscode`): format via `source.format.oxc`, then apply lint fixes
via `source.fixAll.oxc`.
