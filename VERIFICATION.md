# Verification record

`VERIFICATION-SUMMARY.json` is a compact, sanitized summary of the observed local candidate results and a fresh portable reproduction. The staging copy retains the exact runnable application source, dependency lock and copied plugin implementation. Full process logs, tokens, databases, environment files and machine paths are excluded.

## Comparison baseline

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

Follow README.md for the one-time development schema/seed initialization, then disable seeding before type generation, production build/start and restart. API and browser create probes expect a fresh synthetic database and fixed fixture IDs; repeat with a new database filename. Cold-cache network dependency downloads and the Chromium download step were not exercised. The production dependency audit was not refreshed; its earlier five moderate findings remain the recorded audit result. No remote CI, full upstream monorepo harness, formal accessibility audit, production migration validation or Linux execution is recorded.
