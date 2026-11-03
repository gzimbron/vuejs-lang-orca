import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const json = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const grammar = () => json('syntaxes/vue.tmLanguage.json');
// These are structural and individual-regex smoke tests, not a TextMate tokenizer.
const matches = (rule, text) => new RegExp(rule.match ?? rule.begin).exec(text);

function visit(value, callback) {
  if (!value || typeof value !== 'object') return;
  callback(value);
  for (const child of Object.values(value)) visit(child, callback);
}

test('manifest declares only a permission-free Vue syntax', () => {
  const manifest = json('orca-plugin.json');
  assert.equal(manifest.manifestVersion, 2);
  assert.equal(manifest.id, 'vuejs-lang');
  assert.equal(manifest.name, 'Vue.js Syntax');
  assert.equal(manifest.version, '1.0.0');
  assert.equal(manifest.execution, 'data');
  assert.equal(manifest.engines.orca, '>=1.4.246');
  assert.equal(manifest.license, 'MIT');
  assert.deepEqual(manifest.author, { name: 'Gustavo Zimbrón', url: 'https://github.com/gzimbron' });
  assert.equal(manifest.repository, 'https://github.com/gzimbron/vuejs-lang-orca');
  const pkg = json('package.json');
  assert.deepEqual(pkg.author, manifest.author);
  assert.equal(pkg.repository.url, `${manifest.repository}.git`);
  assert.deepEqual(manifest.capabilities, []);
  for (const field of ['publisher', 'main', 'pluginApi']) assert.equal(field in manifest, false);
  assert.deepEqual(Object.keys(manifest.contributes), ['syntaxes']);
  const [syntax] = manifest.contributes.syntaxes;
  assert.equal(manifest.contributes.syntaxes.length, 1);
  assert.equal(syntax.scopeName, grammar().scopeName);
  assert.deepEqual(syntax.extensions, ['.vue']);
  assert.equal(syntax.path, 'syntaxes/vue.tmLanguage.json');
  assert.equal(syntax.configuration, 'syntaxes/language-configuration.json');
});

test('all includes resolve locally and all expressions compile in the smoke-test engine', () => {
  const g = grammar();
  assert.equal(g.scopeName, 'text.html.vue');
  visit(g, (rule) => {
    if (rule.include) {
      assert.ok(rule.include.startsWith('#'), `Nonlocal include: ${rule.include}`);
      assert.ok(g.repository[rule.include.slice(1)], `Missing include: ${rule.include}`);
    }
    for (const key of ['match', 'begin', 'end']) if (rule[key]) assert.doesNotThrow(() => new RegExp(rule[key]));
  });
});

test('root prioritizes comments and embedded regions over ordinary tags', () => {
  assert.deepEqual(grammar().patterns.map((p) => p.include), [
    '#html-comment', '#script', '#style', '#interpolation', '#tag', '#entity',
  ]);
  for (const name of ['script', 'style']) {
    const rule = grammar().repository[name];
    assert.ok(matches(rule, `<${name} lang="${name === 'script' ? 'ts' : 'css'}">`));
    assert.ok(new RegExp(rule.end).test(`</${name}>`));
    assert.ok(!matches(rule, `<${name}-widget>`));
  }
});

test('Vue directives cover longhand, shorthands, modifiers and dynamic arguments', () => {
  const rule = grammar().repository.directive;
  for (const text of ['v-if', 'v-for', 'v-model.trim', 'v-bind:class', 'v-on:click.stop', ':class', '@click.prevent', '#default', ':[key].prop', '@[event].once', 'v-slot:[name]']) {
    assert.equal(matches(rule, `${text}="value"`)?.[0], text);
  }
  assert.equal(matches(rule, 'class="card"'), null);
});

test('interpolations and directive values use local JavaScript rules', () => {
  const repo = grammar().repository;
  assert.ok(matches(repo.interpolation, '{{ count + 1 }}'));
  assert.equal(repo.interpolation.end, '\\}\\}');
  assert.deepEqual(repo.interpolation.patterns, [{ include: '#javascript' }]);
  for (const rule of repo['directive-value'].patterns) {
    assert.deepEqual(rule.patterns, [{ include: '#javascript' }]);
  }
  assert.ok(matches(repo['js-keyword'], 'const count = ref(0)'));
  assert.ok(matches(repo['js-keyword'], 'interface Props {}'));
  assert.ok(matches(repo['js-number'], '42'));
});

test('HTML attributes, comments, tags and local CSS rules are present', () => {
  const repo = grammar().repository;
  assert.ok(matches(repo.tag, '<MyCard :title="title">'));
  assert.ok(matches(repo.tag, '</template>'));
  assert.ok(matches(repo['html-comment'], '<!-- note -->'));
  assert.ok(matches(repo.attribute, 'data-label="label"'));
  assert.ok(matches(repo['css-property'], 'color: #42b883;'));
  assert.ok(matches(repo['css-number'], '12px'));
  assert.ok(matches(repo['css-color'], '#42b883'));
});

test('language configuration supplies HTML comments and paired delimiters', () => {
  const config = json('syntaxes/language-configuration.json');
  assert.deepEqual(config.comments, { blockComment: ['<!--', '-->'] });
  for (const pair of [['{', '}'], ['[', ']'], ['(', ')']]) assert.ok(config.brackets.some((p) => JSON.stringify(p) === JSON.stringify(pair)));
  for (const open of ['{', '[', '(', '"', "'"]) {
    assert.ok(config.autoClosingPairs.some((p) => p.open === open));
    assert.ok(config.surroundingPairs.some((p) => p.open === open && typeof p.close === 'string'));
  }
});

test('example exercises template, TypeScript setup, CSS and Vue shorthand', () => {
  const example = readFileSync(new URL('../examples/Counter.vue', import.meta.url), 'utf8');
  for (const text of ['<template>', '<script setup lang="ts">', '<style scoped>', 'v-for', ':key', '@click', '{{', '#default', 'v-model']) assert.ok(example.includes(text), text);
});
