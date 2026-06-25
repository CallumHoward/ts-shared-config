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

The `.vscode` settings assume the `oxc.oxc-vscode` extension; adjust the
`source.fixAll.oxc` code-action id if your oxc extension version differs.
