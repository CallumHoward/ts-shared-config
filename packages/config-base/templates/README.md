# config-base templates

Files that pnpm and editors read but cannot `import`/`extends` from a package.
Copy them into your repo once (re-copy to pick up updates).

| Template | Copy to |
| --- | --- |
| `pnpm-workspace.yaml` | merge the keys into your `pnpm-workspace.yaml` |
| `editorconfig` | `.editorconfig` |
| `nvmrc` | `.nvmrc` |
| `vscode/settings.json` | `.vscode/settings.json` |
| `vscode/extensions.json` | `.vscode/extensions.json` |

`lefthook` and `fallow` are **not** here — they support native inheritance, so
they're consumed live instead of copied (see the config-base README):

```yaml
# lefthook.yml
extends:
  - node_modules/@callumhoward/config-base/lefthook.yml
```
```jsonc
// .fallowrc.json
{ "extends": ["./node_modules/@callumhoward/config-base/fallow.json"] }
```

The `.vscode` settings follow the Oxc extension's recommended fix/format-on-save
setup (`oxc.oxc-vscode`): format via `source.format.oxc`, then apply lint fixes
via `source.fixAll.oxc`.
