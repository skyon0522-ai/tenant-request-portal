import { writeFile, readFile, mkdir } from 'node:fs/promises'
import assert from 'node:assert/strict'
await mkdir(new URL('../test-results/', import.meta.url), { recursive: true })
const base = 'http://127.0.0.1:3230'
const results = []
async function call(path, { token, method = 'GET', data, cookie } = {}) {
  const r = await fetch(base + path, { method, signal: AbortSignal.timeout(90000),
    headers: { ...(token ? { Authorization: `JWT ${token}` } : {}),
      ...(data ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: data ? JSON.stringify(data) : undefined })
  const text = await r.text()
  let body
  try { body = JSON.parse(text) } catch { body = { unexpectedHTML: text.slice(0, 150) } }
  return { status: r.status, body }
}
async function login(email) {
  const r = await call('/api/users/login', { method: 'POST', data: { email, password: 'demo' } })
  assert.equal(r.status, 200, `login ${email}: ${JSON.stringify(r.body)}`)
  return r.body
}
function denied(name, r) {
  assert.ok(r.status >= 400 && r.status < 500, `${name}: ${JSON.stringify(r)}`)
  results.push({ name, status: r.status, passed: true })
}
function equal(name, actual, expected) {
  assert.deepEqual(actual, expected, name)
  results.push({ name, passed: true })
}
const requester = await login('requester1@example.test')
const other = await login('requester2@example.test')
const staff = await login('tenant1@payloadcms.com')
const tenant = value => typeof value === 'object' ? value.id : value
if (process.argv.includes('--restart')) {
  const marker = JSON.parse(await readFile(new URL('../test-results/durability-marker.json', import.meta.url)))
  const r = await call(`/api/pages/${marker.id}?depth=0`, { token: requester.token })
  equal('request survives restart', { title: r.body.title, body: r.body.body, status: r.body.status, response: r.body.response }, marker.document)
  const h = await call(`/api/pages/versions?depth=0&where[parent][equals]=${marker.id}`, { token: requester.token })
  equal('native versions survive restart', h.body.totalDocs, marker.versions)
  denied('foreign direct ID after restart', await call(`/api/pages/${marker.id}`, { token: other.token }))
  await writeFile(new URL('../test-results/restart-api.json', import.meta.url), JSON.stringify({ runtime: process.version, results }, null, 2) + '\n')
} else {
  denied('missing session list', await call('/api/pages'))
  denied('malformed session list', await call('/api/pages', { token: 'malformed' }))
  denied('anonymous versions', await call('/api/pages/versions'))
  const list = await call('/api/pages?depth=0', { token: requester.token })
  equal('requester list belongs only to tenant 1', list.body.docs.map(d => tenant(d.tenant)), list.body.docs.map(() => 1))
  const create = data => call('/api/pages', { token: requester.token, method: 'POST', data })
  denied('create-body foreign tenant spoof', await create({ tenant: 2, slug: 'spoof', title: 'Spoof', body: 'Synthetic probe' }))
  denied('required body validation', await create({ tenant: 1, slug: 'missing-body', title: 'Invalid' }))
  denied('bounded subject validation', await create({ tenant: 1, slug: 'long-subject', title: 'x'.repeat(121), body: 'Synthetic probe' }))
  const created = await create({ tenant: 1, slug: 'api-request', title: 'Local service request', body: 'Synthetic customer needs assistance.', status: 'closed', response: 'forged staff reply' })
  equal('native create succeeds', created.status, 201)
  const id = created.body.doc.id
  equal('requester cannot choose initial staff status', created.body.doc.status, 'new')
  equal('requester cannot forge initial response', created.body.doc.response ?? null, null)
  denied('other tenant direct ID', await call(`/api/pages/${id}`, { token: other.token }))
  denied('requester update', await call(`/api/pages/${id}`, { token: requester.token, method: 'PATCH', data: { status: 'closed' } }))
  denied('staff foreign update', await call('/api/pages/2', { token: staff.token, method: 'PATCH', data: { status: 'closed' } }))
  const selector = await call('/api/pages?depth=0', { token: requester.token, cookie: 'payload-tenant=2' })
  equal('forged tenant cookie cannot expand membership', selector.body.docs.map(d => tenant(d.tenant)), selector.body.docs.map(() => 1))
  const selfPatch = await call(`/api/users/${requester.user.id}`, { token: requester.token, method: 'PATCH', data: { tenants: [{ tenant: 2, roles: ['tenant-admin'] }], roles: ['super-admin'] } })
  equal('protected membership PATCH leaves original membership', selfPatch.body.doc.tenants.map(t => tenant(t.tenant)), [1])
  equal('protected global role cannot self-elevate', selfPatch.body.doc.roles.includes('super-admin'), false)
  const refreshed = await login('requester1@example.test')
  denied('membership switch cannot expose foreign ID', await call('/api/pages/2', { token: refreshed.token }))
  const update = await call(`/api/pages/${id}`, { token: staff.token, method: 'PATCH', data: { tenant: 2, status: 'in_progress', response: 'Staff is reviewing this request.' } })
  equal('staff update succeeds without tenant in required access predicate', update.status, 200)
  equal('request tenant is immutable', tenant(update.body.doc.tenant), 1)
  const initialTimestamp = created.body.doc.updatedAt
  const closed = await call(`/api/pages/${id}`, { token: staff.token, method: 'PATCH', data: { status: 'closed', response: 'Resolved locally.', updatedAt: initialTimestamp } })
  equal('native ordinary update accepts a stale supplied timestamp', closed.status, 200)
  const history = await call(`/api/pages/versions?depth=0&where[parent][equals]=${id}`, { token: requester.token })
  equal('native version list readable in own tenant', history.status, 200)
  assert.ok(history.body.totalDocs >= 3, 'native create and updates leave snapshots')
  equal('version states include new, in_progress and closed', [...new Set(history.body.docs.map(v => v.version.status))].sort(), ['closed', 'in_progress', 'new'])
  const foreignHistory = await call(`/api/pages/versions?depth=0&where[parent][equals]=${id}`, { token: other.token })
  equal('foreign history list is empty', foreignHistory.body.totalDocs, 0)
  denied('foreign version direct ID', await call(`/api/pages/versions/${history.body.docs[0].id}`, { token: other.token }))
  denied('delete disabled', await call(`/api/pages/${id}`, { token: staff.token, method: 'DELETE' }))
  const current = await call(`/api/pages/${id}?depth=0`, { token: requester.token })
  const { title, body, status, response } = current.body
  await writeFile(new URL('../test-results/durability-marker.json', import.meta.url), JSON.stringify({ id, document: { title, body, status, response }, versions: history.body.totalDocs }, null, 2) + '\n')
  await writeFile(new URL('../test-results/requests-api.json', import.meta.url), JSON.stringify({ runtime: process.version, results, versionCount: history.body.totalDocs, limitations: ['Native versions are capped at 20 per document; no append-only or atomic-history guarantee tested.', 'Native ordinary REST updates do not refuse stale updatedAt.'] }, null, 2) + '\n')
}
console.log(JSON.stringify(results, null, 2))
