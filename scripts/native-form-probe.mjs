import { chromium } from '../app/node_modules/playwright/index.mjs'
import { writeFile, mkdir } from 'node:fs/promises'
import assert from 'node:assert/strict'
await mkdir(new URL('../test-results/', import.meta.url), { recursive: true })

const adapted = process.argv.includes('--requests')
const stage = adapted ? 'requests' : 'baseline'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()
const errors = []
page.on('pageerror', e => errors.push(e.message))
await page.route('**/*', route => {
  const u = new URL(route.request().url())
  return u.hostname === '127.0.0.1' ? route.continue() : route.abort()
})
try {
  await page.goto('http://127.0.0.1:3230/admin/login', { timeout: 90000 })
  await page.locator('#field-email').fill(adapted ? 'requester1@example.test' : 'tenant1@payloadcms.com')
  await page.locator('#field-password').fill('demo')
  await page.getByRole('button', { name: 'Login', exact: true }).click()
  await page.waitForURL('**/admin', { timeout: 90000 })
  await page.goto('http://127.0.0.1:3230/admin/collections/pages', { timeout: 90000 })
  if (!adapted) {
    await page.getByRole('link', { name: 'Page for Tenant 1', exact: true }).click()
    await page.locator('#field-title').waitFor()
    assert.equal(await page.locator('#field-title').inputValue(), 'Page for Tenant 1')
    await writeFile(new URL('../test-results/baseline-native-form.txt', import.meta.url), await page.locator('body').innerText())
    await writeFile(new URL('../test-results/baseline-browser.json', import.meta.url), JSON.stringify({ stage, passed: true, flow: 'native login/list/detail', browser: browser.version(), errors }, null, 2) + '\n')
    console.log('baseline: native login, list and detail passed; create was unavailable for the tenant actor')
  } else {
  await page.locator('a[href="/admin/collections/pages/create"]').click()
  await page.locator('#field-title').fill(`${stage} native form request`)
  await page.locator('#field-slug').fill(`${stage}-native-form`)
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.getByText(/This field is required/).first().waitFor()
  assert.equal(await page.locator('#field-title').inputValue(), `${stage} native form request`)
  await page.locator('#field-body').fill('Synthetic service request entered through the copied native admin form.')
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.waitForURL(/\/admin\/collections\/pages\/\d+$/, { timeout: 30000 })
  await page.getByText('successfully', { exact: false }).first().waitFor({ timeout: 30000 })
  assert.equal(await page.locator('#field-title').inputValue(), `${stage} native form request`)
  const text = await page.locator('body').innerText()
  await writeFile(new URL(`../test-results/${stage}-native-form.txt`, import.meta.url), text)
  await writeFile(new URL(`../test-results/${stage}-browser.json`, import.meta.url), JSON.stringify({ stage, passed: true, browser: browser.version(), url: page.url(), errors }, null, 2) + '\n')
  console.log(`${stage}: native login, list, create, save and detail passed`)
  }
} catch (error) {
  await writeFile(new URL(`../test-results/${stage}-browser-failure.txt`, import.meta.url), `${error.stack}\n\n${await page.locator('body').innerText()}`)
  throw error
} finally {
  await browser.close()
}
