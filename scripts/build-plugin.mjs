// Standalone version of the upstream plugin's TypeScript build + copyfiles process.
import { spawnSync } from 'node:child_process'
import { readdir, mkdir, copyFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
const app = fileURLToPath(new URL('../app/', import.meta.url))
const plugin = path.join(app, 'vendor/plugin-multi-tenant')
const result = spawnSync(process.execPath, [path.join(app, 'node_modules/typescript/bin/tsc'), '-p', path.join(plugin, 'tsconfig.local.json')], { stdio: 'inherit' })
if (result.status !== 0) process.exit(result.status ?? 1)
async function copyAssets(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const source = path.join(dir, entry.name)
    if (entry.isDirectory()) await copyAssets(source)
    else if (/\.(html|css|scss|ttf|woff2?|eot|svg|jpg|png|json)$/.test(entry.name)) {
      const target = path.join(plugin, 'dist', path.relative(path.join(plugin, 'src'), source))
      await mkdir(path.dirname(target), { recursive: true })
      await copyFile(source, target)
    }
  }
}
await copyAssets(path.join(plugin, 'src'))
console.log('Copied upstream tenant plugin compiled; source implementation unchanged.')
