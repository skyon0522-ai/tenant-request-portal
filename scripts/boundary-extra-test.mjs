import assert from 'node:assert/strict'
import { writeFile, mkdir } from 'node:fs/promises'
await mkdir(new URL('../test-results/', import.meta.url), { recursive: true })
const base = 'http://127.0.0.1:3230'
const results = []
async function request(path, token, method = 'GET', data) {
  const r = await fetch(base + path, { method, signal: AbortSignal.timeout(90000), headers: { ...(token ? { Authorization: `JWT ${token}` } : {}), ...(data ? { 'Content-Type': 'application/json' } : {}) }, body: data ? JSON.stringify(data) : undefined })
  return { status: r.status, body: await r.json() }
}
const denied = (name, r) => { assert.ok(r.status >= 400 && r.status < 500, name); results.push({ name, status: r.status, passed: true }) }
const first = (await request('/api/users/login', null, 'POST', { email: 'requester1@example.test', password: 'demo' })).body
const second = (await request('/api/users/login', null, 'POST', { email: 'requester2@example.test', password: 'demo' })).body
const created = await request('/api/pages', first.token, 'POST', { tenant: 1, title: 'Independent boundary probe', body: 'Synthetic repeatable boundary example.' })
assert.equal(created.status, 201)
const requestPath = `/api/pages/${created.body.doc.id}`
denied('anonymous direct request ID', await request(requestPath))
denied('anonymous update', await request(requestPath, null, 'PATCH', { status: 'closed' }))
denied('malformed session create', await request('/api/pages', 'malformed', 'POST', { tenant: 1, title: 'No session', slug: 'no-session', body: 'Synthetic probe' }))
const list = await request('/api/pages?depth=0', second.token)
assert.ok(list.body.docs.length > 0)
assert.ok(list.body.docs.every(d => d.tenant === 2))
results.push({ name: 'tenant 2 list scoped to tenant 2', passed: true })
const ownRole = await request(`/api/users/${first.user.id}`, first.token, 'PATCH', { tenants: first.user.tenants.map(t => ({ ...t, roles: ['tenant-admin'] })) })
assert.deepEqual(ownRole.body.doc.tenants.map(t => t.roles), [['tenant-viewer']])
results.push({ name: 'requester cannot self-promote within own tenant', passed: true })
denied('self-promotion cannot grant staff update', await request(requestPath, first.token, 'PATCH', { status: 'in_progress' }))
for (const [label, token] of [['anonymous', null], ['foreign requester', second.token]]) {
  const r = await fetch(base + '/tenant-slugs/gold/home', { redirect: 'manual', headers: token ? { Authorization: `JWT ${token}` } : {} })
  const text = await r.text()
  assert.ok(!text.includes('Synthetic customer request for Tenant 1.'))
  results.push({ name: `${label} native slug page does not expose private request`, status: r.status, passed: true })
}
await writeFile(new URL('../test-results/boundary-extra.json', import.meta.url), JSON.stringify({ results }, null, 2) + '\n')
console.log(JSON.stringify(results, null, 2))
