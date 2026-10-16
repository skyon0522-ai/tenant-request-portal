// Local synthetic demo lifecycle. Payload remains the application/runtime.
import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = realpathSync(fileURLToPath(new URL('../', import.meta.url)))
const app = path.join(root, 'app')
const data = path.join(root, 'data')
const lockFile = path.join(data, '.operation.json')
const readyFile = path.join(data, '.initialized.json')
const database = path.join(data, 'demo.sqlite')
const envFile = path.join(app, '.env')
const command = process.argv[2]
let child
let interrupted = false
let ownedLock

function safePath(target) {
  const relative = path.relative(root, target)
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw Error('Refusing a path outside this copy.')
  let current = root
  for (const part of relative.split(path.sep)) {
    current = path.join(current, part)
    try {
      if (lstatSync(current).isSymbolicLink() || realpathSync(current) !== current) throw Error(`Refusing symbolic link or escaped path: ${relative}`)
    } catch (error) { if (error.code === 'ENOENT') return; throw error }
  }
}
function identity(pid) {
  try { return readFileSync(`/proc/${pid}/stat`, 'utf8').split(') ').at(-1).split(' ')[19] }
  catch (error) { if (error.code === 'ENOENT') return null; throw error }
}
function readLock() {
  if (!existsSync(lockFile)) return null
  safePath(lockFile)
  const state = JSON.parse(readFileSync(lockFile, 'utf8'))
  if (!Number.isSafeInteger(state.pid) || typeof state.started !== 'string' || !['setup', 'start'].includes(state.command) || state.root !== root) throw Error('Ambiguous operation lock; inspect data/.operation.json. No process was signalled.')
  return state
}
function claim() {
  const current = readLock()
  if (current) throw Error(identity(current.pid) === current.started ? `This copy already has a ${current.command} process (PID ${current.pid}).` : 'A stale operation lock exists. Inspect it and the process list before moving data/.operation.json aside; no data was changed.')
  ownedLock = { pid: process.pid, started: identity(process.pid), command, root }
  writeFileSync(lockFile, JSON.stringify(ownedLock) + '\n', { flag: 'wx', mode: 0o600 })
}
function release() {
  if (ownedLock && JSON.stringify(readLock()) === JSON.stringify(ownedLock)) unlinkSync(lockFile)
}
function environment(create = false) {
  safePath(envFile)
  if (!existsSync(envFile) && create) {
    writeFileSync(envFile, `DATABASE_URL=file:../data/demo.sqlite\nPAYLOAD_SECRET=${randomBytes(48).toString('hex')}\nPAYLOAD_PUBLIC_SERVER_URL=http://127.0.0.1:3230\nNEXT_TELEMETRY_DISABLED=1\n`, { flag: 'wx', mode: 0o600 })
  }
  if (!existsSync(envFile)) throw Error('Run setup first; app/.env is missing.')
  const values = Object.fromEntries(readFileSync(envFile, 'utf8').trim().split(/\r?\n/).filter(line => line && !line.startsWith('#')).map(line => {
    const at = line.indexOf('=')
    if (at < 1) throw Error('Invalid app/.env line. Values are not printed.')
    return [line.slice(0, at), line.slice(at + 1)]
  }))
  if (values.DATABASE_URL !== 'file:../data/demo.sqlite' || !/^[a-f0-9]{96}$/.test(values.PAYLOAD_SECRET || '') || values.PAYLOAD_PUBLIC_SERVER_URL !== 'http://127.0.0.1:3230' || values.NEXT_TELEMETRY_DISABLED !== '1' || Object.keys(values).some(key => !['DATABASE_URL', 'PAYLOAD_SECRET', 'PAYLOAD_PUBLIC_SERVER_URL', 'NEXT_TELEMETRY_DISABLED'].includes(key))) throw Error('app/.env does not match this local demo. Existing configuration was preserved; use a separate fresh copy.')
  return { ...process.env, ...values, PATH: `${path.dirname(process.execPath)}:${process.env.PATH || ''}`, PAYLOAD_CONFIG_PATH: path.join(app, 'src/payload.config.ts'), PAYLOAD_MIGRATING: 'false', SEED_DB: 'false', PAYLOAD_DROP_DATABASE: 'false', NEXT_TELEMETRY_DISABLED: '1' }
}
function initialized() {
  safePath(readyFile)
  safePath(database)
  if (!existsSync(database) || !existsSync(readyFile) || readFileSync(readyFile, 'utf8') !== '{"version":1}\n') throw Error('No completed demo initialization. Run setup in a fresh copy; preserve any existing data.')
}
async function vacantPort() {
  await new Promise((resolve, reject) => {
    const server = net.createServer()
    server.once('error', () => reject(Error('127.0.0.1:3230 is occupied. No existing process was stopped.')))
    server.listen(3230, '127.0.0.1', () => server.close(resolve))
  })
}
function run(args, env) {
  return new Promise((resolve, reject) => {
    if (interrupted) return reject(Error('Stopped before the next command; existing data was preserved.'))
    child = spawn(process.execPath, args, { cwd: app, env, stdio: 'inherit', detached: true })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      child = undefined
      if (interrupted) reject(Error('Stopped; local data and configuration were preserved.'))
      else if (code !== 0) reject(Error(`Child command failed (${signal || code}). Existing data was preserved.`))
      else resolve()
    })
  })
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  interrupted = true
  process.exitCode = signal === 'SIGINT' ? 130 : 143
  if (child) { try { process.kill(-child.pid, 'SIGTERM') } catch (error) { if (error.code !== 'ESRCH') throw error } }
})

try {
  if (process.platform !== 'linux') throw Error('These lifecycle commands support Linux only.')
  if (!['setup', 'start', 'stop', 'status'].includes(command) || process.argv.length !== 3) throw Error('Usage: node scripts/demo.mjs setup|start|stop|status')
  for (const target of [app, envFile, data, lockFile, readyFile, database]) safePath(target)
  if (!lstatSync(app).isDirectory()) throw Error('This copy’s app directory is missing or invalid.')
  mkdirSync(data, { recursive: true, mode: 0o700 })
  if (command === 'status' || command === 'stop') {
    const state = readLock()
    if (!state) console.log('Stopped. Data and configuration are preserved.')
    else if (identity(state.pid) !== state.started) throw Error('Stale operation lock; no process was signalled. Inspect data/.operation.json and the process list.')
    else if (command === 'status') console.log(`Owned ${state.command} process: PID ${state.pid}.`)
    else {
      if (state.command !== 'start') throw Error('Setup is active; stop it with Ctrl+C in its own terminal.')
      process.kill(state.pid, 'SIGTERM')
      for (let i = 0; i < 150 && existsSync(lockFile); i++) await new Promise(resolve => setTimeout(resolve, 100))
      if (existsSync(lockFile)) throw Error('Shutdown is still pending. No forced termination was attempted.')
      console.log('Owned server stopped. Data and configuration are preserved.')
    }
  } else {
    claim()
    const env = environment(command === 'setup')
    if (command === 'setup') {
      safePath(database)
      safePath(readyFile)
      if (existsSync(database)) initialized()
      else if (existsSync(readyFile)) throw Error('Initialization marker exists without its database; preserve this copy for inspection.')
      const npm = path.resolve(path.dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js')
      if (!existsSync(npm)) throw Error('npm must be installed alongside this Node runtime.')
      await run([npm, 'ci', '--no-fund', '--no-audit'], env)
      await run([npm, 'run', 'build:plugin'], env)
      if (!existsSync(database)) {
        await run(['node_modules/payload/bin.js', 'run', 'src/initialize-demo.ts'], { ...env, NODE_ENV: 'development' })
        writeFileSync(readyFile, '{"version":1}\n', { flag: 'wx', mode: 0o600 })
      } else console.log('Existing initialized database preserved; no seed ran.')
      await run([npm, 'run', 'generate:types'], env)
      await run([npm, 'run', 'build'], { ...env, NODE_ENV: 'production' })
      await run([npm, 'run', 'typecheck'], env)
      console.log('Setup complete. Start with: node scripts/demo.mjs start')
    } else {
      initialized()
      if (!existsSync(path.join(app, '.next/BUILD_ID'))) throw Error('Production build is missing; run setup.')
      await vacantPort()
      console.log('Local synthetic demo: http://127.0.0.1:3230/admin — Ctrl+C or demo.mjs stop to stop this copy.')
      await run(['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3230'], { ...env, NODE_ENV: 'production' })
    }
  }
} catch (error) {
  console.error(error.message)
  process.exitCode ||= 1
} finally { release() }
