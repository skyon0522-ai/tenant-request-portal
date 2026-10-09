import { chromium } from '../app/node_modules/playwright/index.mjs'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import assert from 'node:assert/strict'
await mkdir(new URL('../test-results/', import.meta.url), { recursive: true })
const fixture = JSON.parse(await readFile(new URL('../test-results/requests-browser.json', import.meta.url)))
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
await page.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort())
try {
  await page.goto('http://127.0.0.1:3230/admin/login')
  await page.locator('#field-email').fill('tenant1@payloadcms.com')
  await page.locator('#field-password').fill('demo')
  await page.getByRole('button', { name: 'Login', exact: true }).click()
  await page.waitForURL('**/admin')
  await page.goto(fixture.url)
  await page.locator('#field-status').click()
  await page.getByRole('option', { name: 'in_progress', exact: true }).click()
  await page.locator('#field-response').fill('Synthetic staff response entered in the native form.')
  const saved = page.waitForResponse(response => response.request().method() === 'PATCH' && response.url().includes('/api/pages/'))
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  assert.equal((await saved).status(), 200)
  assert.equal(await page.locator('#field-response').inputValue(), 'Synthetic staff response entered in the native form.')
  await page.locator('a').filter({ hasText: 'Versions' }).first().click()
  await page.waitForURL(/\/versions$/)
  const text = await page.locator('body').innerText()
  assert.match(text, /Versions/)
  await writeFile(new URL('../test-results/staff-versions-form.txt', import.meta.url), text)
  await writeFile(new URL('../test-results/staff-browser.json', import.meta.url), JSON.stringify({ passed: true, browser: browser.version(), flow: 'native staff status/response/save/version list', errors }, null, 2) + '\n')
  console.log('Native staff update and version forms passed.')
} catch (error) {
  await writeFile(new URL('../test-results/staff-browser-failure.txt', import.meta.url), `${error.stack}\n\n${await page.locator('body').innerText()}`)
  throw error
} finally { await browser.close() }
