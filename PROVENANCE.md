# Source provenance

Repository: [Payload](https://github.com/payloadcms/payload), tag **v3.90.2**, peeled commit **6254c3bf561a205223849a6497d7dae824d4e81b**, MIT. The pinned repository was inspected and its actual source extracted before adaptation.

| Included source | Local path | Use |
| --- | --- | --- |
| All 50 files in `examples/multi-tenant` | `original-example/` | Byte-identical original application, manifest, pnpm lock and documentation archive |
| Working example application | `app/src/` | Copied native routes/layouts, login/render components, collections, helpers and seed; minimal Requests adaptation |
| All 91 source files in `packages/plugin-multi-tenant/src` | `app/vendor/plugin-multi-tenant/src/` | Byte-identical tenant plugin implementation, compiled locally and resolved through a local `file:` dependency |
| Original plugin package/build metadata and notice | `upstream-plugin-metadata/` | Exact pinned Git bytes for package.json, .swcrc, tsconfig.json, README.md and LICENSE.md |
| Executed composition baseline | `baseline-source/` | Application source/configuration and npm lock before the seven-file Requests improvement |

`SOURCE-MANIFEST.json` maps original example paths and hashes to `original-example/`. `PLUGIN-SOURCE-MANIFEST.json` maps plugin paths and hashes to the working vendor directory. The directory rename from the locally retained `imported-example/` to `original-example/` changes no file bytes. `PUBLIC-STAGE-MANIFEST.json` is the retained historical portable distribution snapshot. `OPERATION-SOURCE-MANIFEST.json` lists and hashes the current export, excluding itself. `scripts/verify-source.mjs` checks the original example, plugin implementation and comparison delta.

Normal dependencies, not copied-source components: Payload core authentication, validation and version engine; Payload admin/UI and Next integration; official SQLite adapter with Drizzle/libSQL; Lexical; Next; React. The copied example mounts these existing dependencies. No custom authentication, SQL storage, browser form engine or history engine is introduced.

## Composition changes

The original example uses PostgreSQL and `latest` package entries; its example pnpm lock refers to older Payload versions. The executed comparison baseline instead used the official SQLite adapter and aligned Payload 3.90.2 dependencies, Next 15.4.11 and React 19.2.8. It retained the original collections, access rules and seed behavior. This is an unchanged application-behavior baseline after explicit database/runtime composition, not an unchanged PostgreSQL or original-lock execution.

The final app pins aligned Payload packages at 3.90.2, the locally copied plugin at 3.90.2, Next **16.3.8** and React/ReactDOM **19.2.8**. `app/package-lock.json` pins the dependency graph. The tested runtime was Windows Node 24.19.0 and npm 11.17.0. Loopback commands, telemetry settings, regenerated native import map/types and the pinned upstream root Next `extensionAlias` wiring are composition work. The original destructive `migrate:fresh` launcher is not used.

The working plugin retains its original name, version, author and license. Its package metadata replaces monorepo workspace peers with exact 3.90.2 peers and uses the original publication `dist` exports. `scripts/build-plugin.mjs` emits strict TypeScript JavaScript/declarations using `tsconfig.local.json` and copies the upstream asset-extension list. This standalone build substitutes for the original monorepo SWC process; the 91 implementation files are unchanged. Original package and build metadata remain separately available for comparison.

## Requests improvement

Against `baseline-source/src`, eight non-generated source files change by **103 added and 55 removed lines** in this operation candidate. `SOURCE-DIFF.json` separates the generated type delta; `comparison/app-source-adaptation.diff` preserves the exact source diff. The original application and plugin remain the runtime core. The new `app/src/initialize-demo.ts` is a local bootstrap through Payload's existing CLI/Local API; `scripts/demo.mjs` supplies Linux setup/process ownership and `scripts/request-example.mjs` supplies a repeatable synthetic operation example.

The previous 2026-10-15 staged candidate is preserved separately. This candidate removes automatic on-start seed execution from its Payload configuration. Explicit initialization runs only with no existing SQLite file. Repeated lifecycle setup preserves initialized data and rebuilds; an unmarked existing database is refused. A later independent review found alternate-database initialization and symbolic-link app-directory gaps. The initializer now validates the exact database/configuration and path ancestry before importing Payload configuration; the launcher preflights protected path ancestry before any environment/lock/data write. The focused regression is `scripts/lifecycle-guard-test.mjs`; original reviewed bytes and findings are retained separately. Runtime and process-ownership checks use native Ubuntu 24.04/WSL2 with Node 24.19.0/npm 11.17.0, as recorded in the current verification section.

| Behavior | Existing component and adaptation |
| --- | --- |
| Tenant list/document/version scope | Unchanged copied plugin `addCollectionAccess`, `withTenantAccess` and `getTenantAccess` utilities |
| Tenant assignment validation | Unchanged copied plugin `enforceTenantMembership` hook and `isValidTenantAssignment` utility |
| Tenant fields, choices and selector | Unchanged copied plugin field/components/endpoint, composed with normal Payload UI |
| Requester create/read and staff update | Copied Pages collection and access helper adapted through native access controls; collection slug remains `pages` |
| Protected membership and role assignment | Copied Users collection adds native field/collection access restrictions |
| SQLite numeric tenant IDs | Existing `extractID` helper replaces a string-only branch in copied tenant access code |
| Login and native forms | Copied example auth configuration/routes/mount; actual authentication and admin form engines remain normal dependencies |
| Persistence and snapshots | Official SQLite/Payload dependencies; versions configured with `maxPerDoc: 20` |

The original Pages collection deliberately allowed anonymous reads; its README documents public pages. Making Requests private is this application's requirement, not an upstream public-page defect claim. The baseline also allowed a synthetic tenant-admin to add a tenant membership; the Requests adaptation protects membership/role assignment and verifies that equivalent attempts leave stored permissions unchanged.

## Licenses and notices

`LICENSE` and `UPSTREAM-LICENSE.md` preserve the pinned root MIT notice, copyright **2018–2025 Payload CMS, Inc.**, SHA-256 `f5622f480e4419ef6be7691d4b04521a5f18365ddedb9a160e92a4b365e94ecd`.

`app/vendor/plugin-multi-tenant/LICENSE.md` preserves the distinct package MIT notice, copyright **2018–2024 Payload CMS, Inc.**, extracted as raw bytes from Git blob `b31a68cbd000f1705476d86c8f0bd7b4b6864af4`. Its SHA-256 is `1afd7aecd7c30356630e7566857d4f2dd7d3df80a5aa53bf33dc25a2edbd9c3b`. `PACKAGE-LICENSE-PROVENANCE.json` binds the commit, path, blob and notice hashes. Upstream implementation identity and authorship are retained.

Primary inspected references: [official SQLite adapter](https://payloadcms.com/docs/database/sqlite), [native versions](https://payloadcms.com/docs/versions/overview), the pinned example and plugin above, and the pinned repository's `test/plugin-multi-tenant/int.spec.ts` and `e2e.spec.ts`. The native monorepo test harness was inspected; it is not counted as executed here.
