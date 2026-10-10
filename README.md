# Tenant Request Portal

## Problem

A local service-request demo for separate customer companies. Requesters create and read their company's requests; staff update status and respond within their assigned company. The browser uses Payload's existing login, list, create, detail and version forms.

## Demo

Open `http://127.0.0.1:3230/admin` after setup. All accounts and requests are synthetic. Every seeded account has the local demo password `demo`.

| Account | Scope |
| --- | --- |
| `requester1@example.test` | Tenant 1 requester |
| `requester2@example.test` | Tenant 2 requester |
| `tenant1@payloadcms.com` | Tenant 1 staff |
| `tenant2@payloadcms.com` | Tenant 2 staff |
| `tenant3@payloadcms.com` | Tenant 3 staff |
| `multi-admin@payloadcms.com` | Staff in all three seeded tenants |
| `demo@payloadcms.com` | Synthetic super-admin |

As a requester, open Requests, choose Create New, enter Subject, Body and a unique Reference, then Save. The reference defaults to `home`, which is already used by each seeded request, so replace it. As staff, open the request, choose `in_progress` or `closed`, enter Response and Save. Versions shows the retained snapshots. Requesters share visibility within their tenant; this is not a per-author inbox. Staff and the super-admin are inherited demo roles, not a new organization-administration product.

## Set up a fresh local copy

The recorded run used Windows Node **24.19.0** and npm **11.17.0**. Use Git and this Node/npm pair to reproduce it. Broader engine ranges in copied upstream metadata have not been verified here. Downloads are needed for pinned npm dependencies and, optionally, Chromium; the demonstrated request workflow uses local synthetic data and no provider integration. Both server launchers bind explicitly to `127.0.0.1:3230`; telemetry is disabled.

From the repository root, create a new environment file and data directory. This command refuses to overwrite an existing environment file and generates a local secret:

```sh
node -e "const fs=require('node:fs'); const crypto=require('node:crypto'); if(fs.existsSync('app/.env')) throw Error('app/.env already exists'); fs.mkdirSync('data',{recursive:true}); fs.writeFileSync('app/.env',fs.readFileSync('app/.env.example','utf8').replace('replace-with-a-random-local-secret',crypto.randomBytes(48).toString('hex')));"
cd app
npm ci --cache .cache/npm
npm run build:plugin
npm run dev
```

Visit `http://127.0.0.1:3230/admin/login` once and wait for the login form. This first development initialization creates the SQLite schema and seeds three tenants, their requests and the accounts above. The seed is not idempotent: run it once against a new database. Do not start another server against the same file.

Stop the development server with Ctrl+C. From `app/`, disable seeding before any further startup, then build and start the production server:

```sh
node -e "const fs=require('node:fs'); fs.writeFileSync('.env',fs.readFileSync('.env','utf8').replace('SEED_DB=true','SEED_DB=false'));"
npm run generate:types
npm run build
npm run typecheck
npm start
```

The database is `data/demo.sqlite`, relative to the repository root. For another test run, choose a new filename in `app/.env` and repeat the one-time development initialization; keep an existing database rather than deleting it. Production starts use the schema initialized in development. Production migration deployment is outside this example.

## Run the checks

Source verification needs only Node and Git; run it from the repository root. The API checks require the running production server and a freshly seeded database. Run them in this order before manually creating requests: the extra boundary probe deliberately uses the fourth request's deterministic synthetic ID.

```sh
node scripts/verify-source.mjs
node scripts/requests-api-test.mjs
node scripts/boundary-extra-test.mjs
```

For the native form probes, install the browser into a local cache. These PowerShell commands run from a second terminal at the repository root:

```powershell
Set-Location app
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Resolve-Path .) '.cache/playwright'
npx --no-install playwright install chromium
Set-Location ..
node scripts/native-form-probe.mjs --requests
node scripts/staff-form-test.mjs
```

The recorded portable reproduction reused an existing matching Chromium cache. The browser download step remains unperformed in that run.

Stop and restart the production server with `SEED_DB=false`, using the same database, then run `node scripts/requests-api-test.mjs --restart`. The restart probe reads the marker written by the first API run. Test output goes to ignored `test-results/`. Browser probes use isolated headless Chromium and abort requests outside `127.0.0.1`; they do not control a user's browser.

## What this project adds

This is an adaptation of the actual [Payload multi-tenant example v3.90.2](https://github.com/payloadcms/payload/tree/6254c3bf561a205223849a6497d7dae824d4e81b/examples/multi-tenant), with its tenant plugin copied as source and compiled locally. It adds private Requests, bounded subject/body fields, three statuses and protected membership assignments. Payload authentication, admin UI and SQLite storage remain normal dependencies. See [PROVENANCE.md](PROVENANCE.md) for the exact reuse boundary and licenses.

### Implementation map

Start with the [runnable app](app/), then inspect the adapted
[Requests collection](app/src/collections/Pages/index.ts) and
[user membership rules](app/src/collections/Users/index.ts).
[PROVENANCE.md](PROVENANCE.md) distinguishes the copied example and plugin from
the request changes. [VERIFICATION.md](VERIFICATION.md) records the API, native
form and restart checks; [SECURITY.md](SECURITY.md) records dependency findings.
The preserved [original example](original-example/) and
[comparison source](baseline-source/) are evidence archives.

## Verification

The portable source was reproduced in a fresh synthetic workspace from its **272-file allowlist**, without an environment file, database, dependency directory or build cache. An offline clean npm install from a copied local cache, plugin build, native type generation, application typecheck, production build, **36 API/boundary/restart checks** and both portable native form flows passed. The API request and its three native snapshots survived a controlled restart. The clean staff form run showed two version rows. [VERIFICATION.md](VERIFICATION.md) distinguishes this reproduction from the earlier candidate results and the unperformed checks.

## Limits

Ordinary native REST updates accepted an old supplied `updatedAt`. Versions retain at most **20 snapshots** per request. There is no demonstrated stale-write refusal, append-only event log, atomic state/history rollback or actor-attributed audit guarantee. Production dependency audit recorded **five moderate findings and zero high or critical findings**, with the remaining esbuild path scoped in [SECURITY.md](SECURITY.md). The audit is not clean. CI, a formal accessibility audit, the full upstream monorepo harness and a Linux run have not been performed.

`original-example/` preserves all 50 original example files, including its original manifest and pnpm lock. `baseline-source/` preserves the executed SQLite-composition comparison source and lock; these are provenance archives, not alternative setup instructions. The runnable app and exact npm lock are in `app/`. Licenses and copyright notices retain upstream identity.

## Security and reporting

Read [security limits and reporting guidance](SECURITY.md) before adapting this example.
