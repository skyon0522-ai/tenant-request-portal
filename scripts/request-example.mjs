// Synthetic local workflow; session tokens remain in memory and are never printed.
import assert from 'node:assert/strict'

const base = 'http://127.0.0.1:3230'
async function call(route, token, method = 'GET', data) {
  const response = await fetch(base + route, {
    method, signal: AbortSignal.timeout(30000),
    headers: { ...(token ? { Authorization: `JWT ${token}` } : {}), ...(data ? { 'Content-Type': 'application/json' } : {}) },
    body: data ? JSON.stringify(data) : undefined,
  })
  if (!response.ok) throw Error(`Local example failed: ${method} ${route} returned ${response.status}.`)
  return response.json()
}
async function login(email) {
  return call('/api/users/login', null, 'POST', { email, password: 'demo' })
}
try {
  const requester = await login('requester1@example.test')
  const staff = await login('tenant1@payloadcms.com')
  const relation = requester.user.tenants[0].tenant
  const tenant = typeof relation === 'object' ? relation.id : relation
  const { doc: request } = await call('/api/pages', requester.token, 'POST', {
    tenant, title: 'Synthetic access-card request', body: 'Please arrange a replacement access card for our synthetic office.',
  })
  assert.equal(request.status, 'new')
  console.log(`Requester created reference ${request.slug}: new`)
  const route = `/api/pages/${request.id}?depth=0`
  const { doc: progress } = await call(route, staff.token, 'PATCH', { status: 'in_progress', response: 'A replacement card is being prepared.' })
  assert.equal(progress.status, 'in_progress')
  console.log('Staff updated the request: in_progress')
  await call(route, staff.token, 'PATCH', { status: 'closed', response: 'The synthetic replacement card is ready for collection.' })
  const closed = await call(route, requester.token)
  assert.equal(closed.status, 'closed')
  assert.equal(closed.response, 'The synthetic replacement card is ready for collection.')
  const history = await call(`/api/pages/versions?depth=0&where[parent][equals]=${request.id}`, requester.token)
  assert.ok(history.totalDocs >= 3)
  console.log(`Requester read the staff response: closed; ${history.totalDocs} retained snapshots.`)
  console.log('Example complete. The synthetic request remains in SQLite for browser inspection and restart verification.')
} catch (error) { console.error(error.message); process.exitCode = 1 }
