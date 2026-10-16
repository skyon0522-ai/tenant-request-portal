// Reuse the pinned Payload CLI, SQLite schema push and original seed.
import { existsSync, lstatSync, realpathSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = path.resolve(fileURLToPath(new URL('../', import.meta.url)))
const root = path.dirname(app)
const configPath = path.join(app, 'src/payload.config.ts')
const database = path.join(root, 'data/demo.sqlite')
if (process.cwd() !== app || realpathSync(app) !== app) throw Error('Initialization must run from this copy’s real app directory.')
if (process.env.DATABASE_URL !== 'file:../data/demo.sqlite') throw Error('Selected database refused; only this copy’s data/demo.sqlite may be initialized.')
if (process.env.PAYLOAD_CONFIG_PATH && path.resolve(app, process.env.PAYLOAD_CONFIG_PATH) !== configPath) throw Error('Selected Payload config refused; use this copy’s src/payload.config.ts.')
for (const target of [configPath, path.join(app, '.env'), database]) {
  let current = root
  for (const part of path.relative(root, target).split(path.sep)) {
    current = path.join(current, part)
    try {
      if (lstatSync(current).isSymbolicLink() || realpathSync(current) !== current) throw Error('Initialization refuses symbolic links or paths outside this copy.')
    } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') break; throw error }
  }
}
if (existsSync(database)) throw Error('Existing database refused; initialization never resets or reseeds it.')
const [{ getPayload }, { default: config }, { seed }] = await Promise.all([import('payload'), import('./payload.config'), import('./seed')])
const payload = await getPayload({ config, disableOnInit: true })
try {
  await seed(payload)
  console.log('Synthetic demo initialized: 3 tenants, 7 users, 3 requests. No HTTP server was started.')
} finally { await payload.destroy() }
