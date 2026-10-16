import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

const base = 'http://127.0.0.1:3230'
const results = []
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const tenant = value => value && typeof value === 'object' ? value.id : value
async function call(path, { token, method = 'GET', data } = {}) {
  const response = await fetch(base + path, {
    method,
    signal: AbortSignal.timeout(90000),
    headers: {
      ...(token ? { Authorization: `JWT ${token}` } : {}),
      ...(data ? { 'Content-Type': 'application/json' } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  })
  return { status: response.status, body: await response.json() }
}

let passed = false
let failure
try {
  const session = await call('/api/users/login', {
    method: 'POST', data: { email: 'requester1@example.test', password: 'demo' },
  })
  assert.equal(session.status, 200, 'synthetic requester login succeeds')
  assert.equal(typeof session.body.token, 'string', 'login returns a session token')
  for (const number of [1, 2]) {
    const created = await call('/api/pages', {
      token: session.body.token,
      method: 'POST',
      data: { tenant: 1, title: `Synthetic automatic reference ${number}`, body: 'Synthetic reference-default probe.' },
    })
    results.push({
      name: `same-tenant request ${number} with reference omitted`,
      status: created.status,
      tenant: tenant(created.body.doc?.tenant) ?? null,
      reference: created.body.doc?.slug ?? null,
    })
  }
  for (const result of results) {
    assert.equal(result.status, 201, result.name)
    assert.equal(result.tenant, 1, `${result.name}: tenant remains 1`)
    assert.match(result.reference, uuid, `${result.name}: default is a UUID v4`)
  }
  assert.notEqual(results[0].reference, results[1].reference, 'new requests receive distinct references')
  passed = true
} catch (error) {
  failure = error.message
  process.exitCode = 1
} finally {
  const receipt = { runtime: process.version, passed, results, ...(failure ? { failure } : {}) }
  await mkdir(new URL('../test-results/', import.meta.url), { recursive: true })
  await writeFile(new URL('../test-results/request-reference.json', import.meta.url), JSON.stringify(receipt, null, 2) + '\n')
  console.log(JSON.stringify(receipt, null, 2))
}
