# Vue.js Syntax for Orca

A small, self-contained community plugin that adds syntax highlighting for Vue
single-file components (`.vue`) in **Orca 1.4.246 or newer**.

**Highlighting only:** no autocomplete, language server, diagnostics, formatting,
Vue compiler, commands, or runtime code. The plugin uses Orca's `data` execution
profile and requests no capabilities. You do not need Node.js to use it in Orca.

## What it highlights

- HTML/component tags, attributes, quoted values, entities, and HTML comments.
- Vue directives such as `v-if`, `v-for`, `v-model.trim`, and `v-bind:class`.
- `:prop`, `@event.stop`, `#slot`, and simple dynamic arguments like `:[key]`.
- `{{ expressions }}` and quoted directive expressions with basic JS tokens.
- `<script>` and `<script setup lang="ts">`: comments, strings, keywords,
  numbers, function calls, and common TypeScript keywords/types.
- `<style>` and `<style scoped>`: comments, strings, properties, class/id and
  pseudo-class selectors, colors, numbers/units, functions, and at-rules.
- HTML block comment markers and paired brackets/quotes through the language
  configuration. The comment shortcut uses `<!-- -->` for the whole Vue file;
  it does not switch comment style inside script or style blocks.

The original TextMate JSON grammar includes its modest JS/TS/CSS rules locally;
it does not rely on external `source.js`, `source.ts`, or `source.css` grammars
(which Orca would leave unresolved). Colors depend on your active Orca theme.

## Try it locally

From this project directory, with the Orca CLI installed:

```sh
orca plugin validate . --json
orca plugin test .
orca plugin check . --json
```

For a **manual preview**, run the following only when you want to load this
folder into your running Orca app:

```sh
orca plugin dev watch .
```

Then open [`examples/Counter.vue`](examples/Counter.vue) in Orca. Watch reloads
changes as you edit the grammar; Ctrl-C stops watching. To remove the development
plugin afterward, use `orca plugin dev unload .`. These app-loading commands are
instructions for the maintainer, not part of the automated checks.

## Development and tests

No dependencies or installation step are needed. With a current Node.js version
that supports the built-in test runner (Node.js 22+ recommended):

```sh
node --test tests/*.test.mjs
# Equivalent convenience commands:
npm test
npm run validate
npm run check
```

The tests verify the manifest, local grammar includes, rule ordering, individual
regex examples, language configuration, and example coverage. **They are not
TextMate tokenization tests**: JavaScript's regex engine is used only for smoke
checks. Orca validation/checking does not replace a visual check of the grammar
in Orca. No full tokenizer engine is bundled or installed by this project.

| File | Purpose |
| --- | --- |
| `orca-plugin.json` | Format 2 manifest; internal id `vuejs-lang` |
| `syntaxes/vue.tmLanguage.json` | Original self-contained Vue grammar |
| `syntaxes/language-configuration.json` | Comment and bracket/quote pairs |
| `examples/Counter.vue` | Manual highlighting fixture, not a runnable Vue app |
| `tests/syntax.test.mjs` | Dependency-free structural and regex smoke tests |

## Intentional limitations

This is a bounded highlighting grammar, not a Vue/HTML/JavaScript parser.

- Only `.vue` is registered; `.js`, `.ts`, `.html`, and `.css` are left alone.
- Use standard lowercase `<script>` and `<style>` blocks. Opening block attributes
  select no separate language mode and are not individually colored. All scripts
  use the same basic JS/TS rules; all styles use the same basic CSS rules.
- Advanced TypeScript types, JSX/TSX, JavaScript regex literals, and expression
  coloring inside backtick `${...}` templates are not implemented.
- SCSS, Sass, Less, Pug, custom blocks, and non-JS script languages have no dedicated
  support. A `lang` attribute does not load another grammar or compiler.
- Deeply nested braces in interpolations, complex dynamic directive arguments,
  malformed markup, unquoted directive expressions, and unusual embedded closing
  tags can be colored imperfectly. There is no cross-language error recovery.
- CSS matching is intentionally basic, not a full selector/declaration parser.
- Orca leaves files over 500,000 characters or 20,000 lines plain. Lines exceeding
  1,000 characters or the grammar time budget can leave the remaining file plain.

## Community distribution

Repository: [gzimbron/vuejs-lang-orca](https://github.com/gzimbron/vuejs-lang-orca).
The plugin's display name is
**Vue.js Syntax**, and its internal id is **`vuejs-lang`** (not an `orca-` prefixed
reserved id). Orca derives the publisher from the repository owner (`gzimbron`);
the manifest does not declare a publisher.

When you choose to publish, host this folder in your GitHub repository, add the
**`orca-plugin`** repository topic, and create the **`v1.0.0`** release tag for this
version after reviewing and testing it. Follow Orca's current community catalog
submission guidance; a repository topic/tag does not guarantee catalog acceptance.
This scaffold does not create a repository, tag, release, or catalog submission.
The private `package.json` exists for local checks, not npm distribution.

## References

- [Orca syntax highlighting reference](https://github.com/stablyai/orca/blob/main/docs/reference/plugin-syntax.md)
- [Orca plugin manifest reference](https://github.com/stablyai/orca/blob/main/docs/reference/plugin-manifest.md)

## Author and license

Created by [**Gustavo Zimbrón**](https://github.com/gzimbron). Licensed under the [MIT License](LICENSE).
