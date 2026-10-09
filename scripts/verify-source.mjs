import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import assert from 'node:assert/strict'

const root = fileURLToPath(new URL('../', import.meta.url))
const sha = data => createHash('sha256').update(data).digest('hex')
const json = async name => JSON.parse(await readFile(path.join(root, name)))
const source = await json('SOURCE-MANIFEST.json')
const plugin = await json('PLUGIN-SOURCE-MANIFEST.json')
for (const entry of source.exampleSource) {
  const target = entry.source.replace('examples/multi-tenant/', 'original-example/')
  assert.equal(sha(await readFile(path.join(root, target))), entry.sha256, target)
}
for (const entry of plugin) {
  const target = entry.source.replace('packages/plugin-multi-tenant/', 'app/vendor/plugin-multi-tenant/')
  assert.equal(sha(await readFile(path.join(root, target))), entry.sha256, target)
}
for (const entry of (await json('BASELINE-SOURCE-MANIFEST.json')).files) {
  assert.equal(sha(await readFile(path.join(root, entry.path))), entry.sha256, entry.path)
}
const notices = await json('PACKAGE-LICENSE-PROVENANCE.json')
assert.equal(sha(await readFile(path.join(root, notices.packageNotice.localPath))), notices.packageNotice.sha256)
for (const target of notices.rootNotice.localPaths) {
  assert.equal(sha(await readFile(path.join(root, target))), notices.rootNotice.sha256, target)
}
const stats = spawnSync('git', ['diff', '--no-index', '--ignore-space-at-eol', '--numstat', 'baseline-source/src', 'app/src'], { cwd: root, encoding: 'utf8' })
if (stats.status !== 0 && stats.status !== 1) throw Error(stats.error?.message || stats.stderr)
const changed = stats.stdout.trim().split('\n').filter(Boolean).map(line => {
  const [added, removed, sourcePath] = line.split('\t')
  return { path: sourcePath, added: Number(added), removed: Number(removed), generated: /payload-types\.ts|importMap\.js|generated-schema/.test(sourcePath) }
})
const custom = changed.filter(entry => !entry.generated)
const actual = { files: custom.length, added: custom.reduce((n, entry) => n + entry.added, 0), removed: custom.reduce((n, entry) => n + entry.removed, 0) }
const expected = (await json('SOURCE-DIFF.json')).customApplicationDelta
assert.deepEqual(actual, expected)
assert.equal(source.exampleSource.length, 50)
assert.equal(plugin.length, 91)
console.log(JSON.stringify({ originalExampleFiles: source.exampleSource.length, unchangedPluginSourceFiles: plugin.length, customApplicationDelta: actual, noticesVerified: true }, null, 2))
