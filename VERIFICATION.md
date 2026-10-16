# Verification record

The current operation results are in [OPERATION-VERIFICATION.json](OPERATION-VERIFICATION.json). [LINUX-VERIFICATION.json](LINUX-VERIFICATION.json) preserves the 2026-10-15 Linux run. `VERIFICATION-SUMMARY.json` preserves the earlier Windows candidate and portable reproduction; its unperformed list describes that older run. Full process logs, tokens, databases, environment files and machine paths are excluded from public records. `PUBLIC-STAGE-MANIFEST.json` is the historical portable snapshot; `OPERATION-SOURCE-MANIFEST.json` binds this candidate's files.

## Dependency follow-up — 2026-10-16

[DEPENDENCY-VERIFICATION.json](DEPENDENCY-VERIFICATION.json) records the new scoped esbuild override and its exact runtime binding. A fresh native Linux copy passed locked install, schema/fixture initialization, unchanged-plugin and production builds, type generation and typecheck. Four focused compatibility/CORS checks, 12 lifecycle guards, 25 API checks, eight additional boundaries, two reference checks, the normal requester/staff example and three controlled-restart checks passed. The owned server was stopped and port 3230 closed.

The production audit changed from five moderate dependency-node findings for one advisory to zero reported findings (exit 0). Only package.json/package-lock.json changed among the 47 recorded runtime paths. This override crosses core-utils' declared esbuild range; the checks establish the recorded demonstration only. The full browser flow, full upstream harness and formal security/accessibility/production validation were not repeated. GitHub CI for these new candidate bytes is unrun; the successful initial CI cited below belongs to the earlier exact published head. Earlier checks and unperformed lists below retain their historical scope.

## Linux installation and operation — 2026-10-16

The previous staged source was inspected alongside its pinned original example, comparison source, installed Payload `run` CLI and SQLite `connect` implementation. A fresh native Linux install of the previous staged code reproduced the startup flaw: the first development start produced three tenants, but restarting with `SEED_DB=true` left six tenants after partial repeated seeding. Existing source packages were preserved.

The new candidate uses `node scripts/demo.mjs setup` from any working directory. An explicit Payload Local API initializer creates schema and synthetic fixtures without an HTTP development server. Startup no longer runs the seed. A fresh native source/data/install used Node 24.19.0 and npm 11.17.0 on Ubuntu 24.04/WSL2, reusing the previously populated npm download cache. Locked install, unchanged-plugin build, initialization, type generation, production build and typecheck passed. This was a fresh install, not a second cold-cache download. No global installation, runtime configuration or background AOE service was changed.

The first initializer placement outside the existing app package hit TSX's CommonJS/top-level-await boundary before any database was created. Moving it into the app's existing ESM package resolved that failure. The successful initializer produced exactly three tenants, seven users and three requests.

| Current check | Observed result |
| --- | --- |
| Repeated direct initializer | Refused; database and environment hashes unchanged |
| Repeated full setup | Exit 0; schema/data/secret hashes unchanged; no seed ran |
| `.env` permissions | `0600` |
| Production start from another working directory | Login route HTTP 200; loopback listener |
| Competing start/setup | Refused while owned operation lock was held |
| Synthetic requester/staff example | Passed twice; create, progress, close and requester response read |
| Main API / extra boundary probes | 25 / 8 checks passed twice, after other synthetic requests; no fourth-ID dependency |
| Omitted-reference requests | Two HTTP 201 responses with distinct UUID v4 references |
| Controlled stop/restart | Three persistence/foreign-tenant checks passed |
| Occupied port | Refused; unrelated listener retained |
| Alternate database path / unmarked existing database | Refused; existing config/data unchanged |
| Mismatched PID start identity | Refused; no process signalled |
| Owned shutdown | Lock removed and port closed after both acceptance server runs |
| Inherited destructive/seed/config-path flags | Overridden to the local/no-seed configuration; fixture membership counts preserved |
| Source verifier | 50 original-example hashes, 91 plugin hashes, notices and current application delta passed |
| Production npm audit, refreshed | Five moderate, zero high/critical; audit exit 1; no automatic fix |

The 36 distinct API/boundary/restart result entries remain 25 + 8 + 3; repeated runs are not counted as new coverage. The lifecycle acceptance has 17 recorded result entries. Normal examples and the two reference creations are additional operations. No browser installation or browser automation was performed by this worker.

The parent separately observed one synthetic flow through the supported Windows in-app browser against the pre-repair native Linux server: requester creation with an automatically supplied reference, staff status/response save, requester readback with disabled fields, and foreign-tenant denial. That observation is bound to fingerprint `264a741f8ca8a56680bfe6f89c60d25136be3163ca253e3eb8e720cdb27a34d9`. The initializer and lifecycle launcher were subsequently repaired as described below; 44 of the 46 recorded entries remain byte-identical. This was not a native Linux browser, physical mobile device or formal accessibility/security audit, and the full browser flow was not repeated after the repair.

The Linux CI workflow now uses the same setup/start/stop commands, checks refusal of repeated initialization and repeats API probes before restart. YAML parsing, extracted Bash syntax and pinned-action checks passed locally; GitHub execution had not yet been observed at this pre-publication verification stage. The current production dependency audit is detailed in SECURITY.md. Concurrency/audit and production-deployment limits below remain applicable; no compare-and-swap change was attempted.

## Lifecycle guard repair — 2026-10-16

An independent review confirmed two gaps in the first operation candidate. A direct Payload CLI invocation could select an alternate existing SQLite database while the initializer checked only the default file. A symbolic-link `app` directory could also receive `.env` outside the product root before setup failed on an unmarked database. Both findings and their original reproduction evidence were retained.

The initializer now validates the exact selected database and recognized config path, checks protected path ancestry, and refuses an existing database before importing config, seed or `getPayload`. The launcher checks app/environment/data path ancestry, including dangling links, before creating a data directory, lock or environment file. These are local filesystem preflight checks; they do not establish protection against concurrent hostile filesystem replacement.

Run the focused offline regression after dependencies have been installed:

```sh
node scripts/lifecycle-guard-test.mjs
```

All 12 focused checks passed, including exact fresh fixtures and repeat refusal. A separate bounded run of the updated launcher reached the login route, reported its owned PID, refused a competing start and stopped normally; database/version counts and the environment hash were unchanged, the lock was removed and port 3230 closed. Typecheck and CI YAML/Bash/pinned-action checks passed. The current repair record in OPERATION-VERIFICATION.json reports these checks separately from the earlier 17 lifecycle entries and API/browser evidence. The CI workflow invokes this regression after setup. The full install, production build, API suite and browser flow were not repeated solely for these bootstrap guards. Application routes, collections, config, lockfile and the copied plugin implementation were unchanged by this repair.

## Linux workflow and automatic references — 2026-10-15

The public baseline at `8fd6fb98ebf578500d867294e6e4321718557551` was copied into a new native Ubuntu 24.04/WSL2 directory. Its 273 source files matched the downloaded commit. Official Linux Node 24.19.0 was checked against the vendor's SHA-256 list; npm 11.17.0 was used. A cold-cache network `npm ci`, plugin build, one development schema/seed initialization, type generation, production Webpack build and typecheck passed. Main API, extra-boundary and controlled-restart probes passed all 36 recorded entries. No global runtime or npm settings changed.

The baseline browser form prefilled Reference with `home`, which already existed in the seeded tenant. Saving Subject and Body without changing Reference failed with the tenant-unique-reference error and retained the entered text. The new `request-reference-test.mjs` reproduced this defect against the unchanged built baseline: both requests with omitted references returned HTTP 400, and the probe exited 1 as expected.

The correction uses a `node:crypto` UUID function as the field default. Explicit references and the existing tenant-scoped uniqueness hook are retained. The changed application and new probe were copied into a separate 274-file native source directory, with no environment file, database, `node_modules` or build cache. Its `npm ci --offline` reused the cache populated by the successful baseline install; this candidate install was not another cold-cache download.

| Corrected Linux check | Observed result |
| --- | --- |
| Plugin build, type generation, production build and typecheck | All exit 0 |
| Main API / extra boundary / controlled restart | 25 / 8 / 3 passed |
| Two creates omitting Reference | HTTP 201; tenant 1; distinct UUID v4 references |
| Requester browser flow | Subject and Body → Save, without editing Reference; saved detail retained the generated value |
| Source verifier before and after build | All 50 original example files and 91 plugin implementation files matched; custom source delta seven files, +76/−50 |

The same new probe bytes were used for the expected baseline failure and the candidate success. The changed collection, probe, source-diff metadata and npm lock remained unchanged during execution. Independent source review confirmed the per-invocation default and Payload's preservation of supplied and existing values; it did not independently rerun the application.

The browser ran on Windows against the native Linux loopback server. The current correction's requester create/save flow was observed; the earlier Linux baseline also exercised the staff response/status/version flow. Native Linux Chromium installation and a formal accessibility audit were not performed. Test-only servers were confirmed absent and port 3230 refused connections after observation.

The new GitHub workflow follows the documented Linux lifecycle, including the three API probes and a controlled restart. Its local static checks are separate from GitHub execution. The initial GitHub Actions synthetic-api run later passed at published commit [`ee2e50a5677a628d4ef669ffbf674b1647ce79a6`](https://github.com/skyon0522-ai/tenant-request-portal/commit/ee2e50a5677a628d4ef669ffbf674b1647ce79a6) on 2026-10-16 (run [`38848132026`](https://github.com/skyon0522-ai/tenant-request-portal/actions/runs/38848132026)). The dependency audit was not refreshed. The historical limits below remain applicable.

## Earlier comparison baseline

The pinned example's domain/application behavior ran with an explicitly substituted official SQLite/runtime composition. Native login and admin list/detail forms worked. Anonymous Pages listing returned the three public pages, as the original README intended. Authenticated tenant lists were scoped; foreign direct IDs returned 404, and foreign update/create-body attempts returned 403. A forged tenant-selector cookie did not expand membership.

A synthetic tenant-admin could self-add a second tenant; a subsequent login exposed both tenants' pages. The actor was restored through native super-admin access. The baseline actor's data-dependent create predicate did not expose Create in the native form. These observations informed the private Requests and protected-membership adaptation. The original PostgreSQL setup, original dependency lock and a full baseline production build were not run unchanged.

## Earlier adapted candidate results

| Executed check | Recorded result |
| --- | --- |
| Clean `npm ci` with local cache | Exit 0 |
| Copied plugin strict TypeScript/declarations and asset build | Exit 0; all 91 implementation source hashes unchanged |
| Native type generation | Exit 0 from app directory |
| Next 16.3.8 production Webpack build | Exit 0 |
| Application typecheck after build | Exit 0 |
| Main loopback API checks | 25 passed |
| Additional authorization/frontend boundary checks | 8 passed |
| Controlled restart checks | 3 passed; request and three native snapshots retained |
| Native requester forms | Login/list/create/required-field error/save/detail passed; error retained subject; no observed page errors |
| Native staff forms | Status/response/save/version list passed; three version rows observed; no observed page errors |
| Listener | `127.0.0.1:3230` observed |
| Production dependency audit | Five moderate, zero high/critical; remaining path documented in SECURITY.md |

The **36** count covers the recorded main, extra-boundary and restart result entries, not the browser flows or the full upstream suite. Checks include missing/malformed sessions, anonymous list/version access, foreign IDs and version IDs, foreign list/history isolation, create-body tenant spoofing, required/bounded fields, requester update refusal, disabled deletion and immutable request tenant assignment. Membership, global-role and same-tenant staff-role spoof attempts left stored permissions unchanged; protected-field PATCH can return 200 while ignoring the forbidden field. Staff could update status/response within their tenant. Native snapshots contained `new`, `in_progress` and `closed`.

Ordinary REST update with an old supplied `updatedAt` returned 200. Native versions are capped at 20 per request. Stale revision refusal, append-only history, atomic state/history rollback, actor attribution and general concurrency correctness are not established.

The recorded browser used isolated headless Chromium 156.0.8078.4. Its probes aborted non-loopback requests. A user's browser and native screen were not controlled. Failed source-resolution, import-map, selector/toast and transient generated-type attempts were retained in the local execution evidence; the final observed results above follow their bounded corrections.

## Portable staging checks and fresh reproduction

Staging source/hash checks confirm all 50 original example files and all 91 copied plugin source files. The adapted app source and npm lock match the verified candidate; the non-generated delta remains seven files, +74/−49. Script syntax and excluded-file checks are recorded separately in the public staging receipt.

Four test probes only change browser lookup/output paths and create their ignored output directory. They use Playwright's installed Chromium and `test-results/`. `scripts/build-plugin.mjs` retains the verified build process. `scripts/verify-source.mjs` checks copied hashes and uses Git to recompute the comparison delta.

The public 272-file allowlist, bound by input manifest SHA-256 `66f5c8c7ecebf9855788441d7487621aac3826da737ad26db7f16b7b9138982b`, was copied into a separate fresh synthetic workspace. No environment file, database, dependency directory or build cache was copied. Windows Node 24.19.0 and npm 11.17.0 were used. Existing npm cache content was copied into the new workspace before `npm ci --offline --no-audit --fund=false --cache .cache/npm`; 384 packages installed, exit 0. npm install-script notices were retained. No global installation or script-approval setting was changed.

The copied plugin build passed. One development startup initialized the SQLite schema and seed through the native login route, returning 200. The owned dev process was stopped and `SEED_DB` changed to false. Native type generation, production build and application typecheck passed; source verification after build still found 50 exact original example files, 91 unchanged plugin implementation files and the seven-file +74/−49 delta. The production listener was observed at `127.0.0.1:3230`.

The documented test order passed: `requests-api-test.mjs` (25 checks), `boundary-extra-test.mjs` (eight), requester forms, staff forms, then stop/restart and `requests-api-test.mjs --restart` (three). Both form probes used the unchanged portable scripts and copied matching Chromium 156.0.8078.4, without a download, and reported no page errors. The clean staff form run showed **two version rows**; the earlier candidate run showed three. The separate API request retained its **three snapshots** across restart. Ordinary stale-timestamp updates remained accepted. No application or setup correction was required.

All owned server processes were stopped. The candidate's 615-file content inventory and three database hashes remained unchanged; the runnable public source and lock were unchanged. Private reproduction evidence is excluded from the public distribution; its final receipt hash is recorded in the summary.

Follow README.md for the one-time development schema/seed initialization, then disable seeding before type generation, production build/start and restart. API and browser create probes expect a fresh synthetic database and fixed fixture IDs; repeat with a new database filename. In this earlier Windows reproduction, cold-cache network dependency downloads and the Chromium download step were not exercised. The production dependency audit was not refreshed; its earlier five moderate findings remain the recorded audit result. That run did not include remote CI, the full upstream monorepo harness, a formal accessibility audit, production migration validation or Linux execution. The newer Linux observations are recorded above.
