// Focused, offline lifecycle regression checks using the already installed Payload CLI.
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { fileURLToPath } from 'node:url'

const source = fileURLToPath(new URL('../', import.meta.url))
const payloadCli = path.join(source, 'app/node_modules/payload/bin.js')
assert.equal(process.platform, 'linux', 'Use the documented Linux runtime.')
assert.ok(existsSync(payloadCli), 'Install this copy’s locked dependencies before running the guard checks.')
const scratch = mkdtempSync(path.join(tmpdir(), 'tenant-lifecycle-guards-'))
const results = []
const hash = p => createHash('sha256').update(readFileSync(p)).digest('hex')
function fixture(name, full = false) {
  const root = path.join(scratch, name)
  mkdirSync(path.join(root, 'app/src'), { recursive: true })
  mkdirSync(path.join(root, 'scripts'))
  cpSync(path.join(source, 'app/package.json'), path.join(root, 'app/package.json'))
  cpSync(path.join(source, 'app/tsconfig.json'), path.join(root, 'app/tsconfig.json'))
  cpSync(path.join(source, 'scripts/demo.mjs'), path.join(root, 'scripts/demo.mjs'))
  if (full) cpSync(path.join(source, 'app/src'), path.join(root, 'app/src'), { recursive: true })
  else {
    cpSync(path.join(source, 'app/src/initialize-demo.ts'), path.join(root, 'app/src/initialize-demo.ts'))
    writeFileSync(path.join(root, 'app/src/payload.config.ts'), "throw Error('CONFIG_IMPORT_REACHED')\n")
  }
  symlinkSync(path.join(source, 'app/node_modules'), path.join(root, 'app/node_modules'), 'dir')
  return root
}
function invoke(root, overrides = {}) {
  return spawnSync(process.execPath, [payloadCli, 'run', 'src/initialize-demo.ts'], {
    cwd: path.join(root, 'app'), encoding: 'utf8', timeout: 90000,
    env: { ...process.env, PATH: `${path.dirname(process.execPath)}:${process.env.PATH || ''}`, DATABASE_URL: 'file:../data/demo.sqlite', PAYLOAD_CONFIG_PATH: path.join(root, 'app/src/payload.config.ts'), PAYLOAD_SECRET: 'a'.repeat(96), PAYLOAD_PUBLIC_SERVER_URL: 'http://127.0.0.1:3230', NEXT_TELEMETRY_DISABLED: '1', NODE_ENV: 'development', SEED_DB: 'false', PAYLOAD_DROP_DATABASE: 'false', PAYLOAD_MIGRATING: 'false', ...overrides },
  })
}
function refuse(result, pattern) {
  assert.ifError(result.error)
  assert.notEqual(result.status, 0, result.stdout + result.stderr)
  assert.match(result.stdout + result.stderr, pattern)
  assert.doesNotMatch(result.stdout + result.stderr, /CONFIG_IMPORT_REACHED/)
}
function database(file) {
  mkdirSync(path.dirname(file), { recursive: true })
  const db = new DatabaseSync(file)
  db.exec('CREATE TABLE tenants(id INTEGER PRIMARY KEY); INSERT INTO tenants VALUES(1),(2),(3);')
  db.close()
}
function count(file, table = 'tenants') {
  const db = new DatabaseSync(file, { readOnly: true })
  try { return db.prepare(`SELECT count(*) AS n FROM ${table}`).get().n }
  finally { db.close() }
}
function record(name, details = {}) { results.push({ name, passed: true, ...details }) }
try {
  const alternate = fixture('alternate-existing')
  const selected = path.join(alternate, 'data/alternate.sqlite')
  database(selected)
  const before = hash(selected)
  refuse(invoke(alternate, { DATABASE_URL: `file:${selected}` }), /Selected database refused/)
  assert.equal(hash(selected), before)
  assert.equal(count(selected), 3)
  assert.equal(existsSync(path.join(alternate, 'data/demo.sqlite')), false)
  record('direct CLI refuses alternate existing database before config import; bytes and three tenants preserved')

  const alternateFresh = fixture('alternate-fresh')
  const absent = path.join(alternateFresh, 'alternate.sqlite')
  refuse(invoke(alternateFresh, { DATABASE_URL: `file:${absent}` }), /Selected database refused/)
  assert.equal(existsSync(absent), false)
  record('direct CLI refuses alternate absent database without creating it')

  const existing = fixture('canonical-existing')
  const canonical = path.join(existing, 'data/demo.sqlite')
  database(canonical)
  const canonicalBefore = hash(canonical)
  refuse(invoke(existing), /Existing database refused/)
  assert.equal(hash(canonical), canonicalBefore)
  assert.equal(count(canonical), 3)
  record('direct CLI refuses canonical existing database before config import; bytes and rows preserved')

  const wrongConfig = fixture('alternate-config')
  refuse(invoke(wrongConfig, { PAYLOAD_CONFIG_PATH: path.join(wrongConfig, 'outside.ts') }), /Selected Payload config refused/)
  assert.equal(existsSync(path.join(wrongConfig, 'data')), false)
  record('direct CLI refuses alternate config before any database is created')

  const linkedData = fixture('initializer-linked-data')
  const outsideData = path.join(scratch, 'outside-initializer-data')
  mkdirSync(outsideData)
  const outsideDatabase = path.join(outsideData, 'demo.sqlite')
  database(outsideDatabase)
  const outsideBefore = hash(outsideDatabase)
  symlinkSync(outsideData, path.join(linkedData, 'data'), 'dir')
  refuse(invoke(linkedData), /symbolic links or paths outside/)
  assert.equal(hash(outsideDatabase), outsideBefore)
  record('direct CLI refuses linked database ancestor and preserves outside database')

  const fresh = fixture('fresh-initialization', true)
  mkdirSync(path.join(fresh, 'data'))
  const initialized = invoke(fresh)
  assert.ifError(initialized.error)
  assert.equal(initialized.status, 0, initialized.stdout + initialized.stderr)
  const freshDb = path.join(fresh, 'data/demo.sqlite')
  const counts = Object.fromEntries(['tenants', 'users', 'pages'].map(table => [table, count(freshDb, table)]))
  assert.deepEqual(counts, { tenants: 3, users: 7, pages: 3 })
  const freshBefore = hash(freshDb)
  refuse(invoke(fresh), /Existing database refused/)
  assert.equal(hash(freshDb), freshBefore)
  record('fresh direct initialization creates exact fixtures and repeated call preserves database', { counts })

  for (const kind of ['app', 'dangling-app', 'env', 'data', 'database', 'marker']) {
    const root = path.join(scratch, `wrapper-${kind}`)
    const outside = path.join(scratch, `outside-${kind}`)
    mkdirSync(path.join(root, 'scripts'), { recursive: true })
    mkdirSync(outside)
    const sentinel = path.join(outside, 'sentinel')
    writeFileSync(sentinel, 'outside bytes must remain unchanged\n')
    cpSync(path.join(source, 'scripts/demo.mjs'), path.join(root, 'scripts/demo.mjs'))
    if (kind === 'app' || kind === 'dangling-app') symlinkSync(kind === 'app' ? outside : path.join(outside, 'absent'), path.join(root, 'app'), 'dir')
    else {
      mkdirSync(path.join(root, 'app'))
      if (kind === 'env') symlinkSync(sentinel, path.join(root, 'app/.env'))
      if (kind === 'data') symlinkSync(outside, path.join(root, 'data'), 'dir')
      if (kind === 'database' || kind === 'marker') {
        mkdirSync(path.join(root, 'data'))
        symlinkSync(sentinel, path.join(root, kind === 'database' ? 'data/demo.sqlite' : 'data/.initialized.json'))
      }
    }
    const sentinelBefore = hash(sentinel)
    const result = spawnSync(process.execPath, [path.join(root, 'scripts/demo.mjs'), 'setup'], { cwd: '/tmp', encoding: 'utf8', timeout: 10000 })
    refuse(result, /Refusing symbolic link or escaped path/)
    assert.equal(hash(sentinel), sentinelBefore)
    assert.equal(existsSync(path.join(outside, '.env')), false)
    assert.equal(existsSync(path.join(root, 'data/.operation.json')), false)
    if (kind !== 'env') assert.equal(existsSync(path.join(root, 'app/.env')), false)
    if (['app', 'dangling-app', 'env'].includes(kind)) assert.equal(existsSync(path.join(root, 'data')), false)
    record(`wrapper refuses ${kind} symlink before environment, lock or outside writes`)
  }
  console.log(JSON.stringify({ runtime: process.version, results }, null, 2))
  rmSync(scratch, { recursive: true })
} catch (error) {
  console.error(JSON.stringify({ completedResults: results }))
  console.error(`Failed fixture retained: ${scratch}`)
  throw error
}
