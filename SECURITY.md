# Local demo and dependency evidence

This application is a loopback synthetic demonstration. The seeded `demo` passwords are public fixtures; they verify no real person's identity and provide no SSO. Generate a fresh local Payload secret as described in README.md. Keep `.env`, databases and test output private. Authentication and tenant controls use the existing Payload/example/plugin implementations rather than a custom security engine.

The demonstrated requester/staff boundaries passed the recorded API/form checks in VERIFICATION.md. Super-admin and multi-tenant staff accounts intentionally have broader fixture scope. Users within one tenant share its requests. The app retains inherited tenant/user collections and routes. Local checks do not establish a hardened hosted deployment, production migrations, a formal accessibility assessment or concurrent-write safety.

## Deliberate dependency changes

The comparison baseline audit recorded 20 findings: two low, ten moderate, seven high and one critical. Its manifest and npm lock are retained under `baseline-source/`; the exact original upstream example manifest and pnpm lock remain under `original-example/`.

Next 15.4.11 in that baseline is affected by the upstream [Windows-hosted RCE advisory](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36), with a patched 16.x boundary of 16.3.3. The app deliberately pins [Next 16.3.8](https://github.com/vercel/next.js/releases/tag/v16.3.8), including later September 30 fixes. It satisfies the observed Payload 3.90.2 peer range `>=16.3.3 <17.0.0`. Webpack mode retains the pinned source-package resolution wiring. A patched dependency does not establish that every application issue is resolved.

Other exact remediation pins and primary references:

| Dependency | Applied version | Primary evidence |
| --- | --- | --- |
| Sharp, direct and nested | 0.35.5 | [Upstream advisory](https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w), patched at 0.35.5 |
| Undici | 7.29.1 | [Upstream advisory](https://github.com/nodejs/undici/security/advisories/GHSA-w293-vg96-wgc3), patched 7.x boundary 7.29.1 |
| PostCSS | 8.5.29 | [Upstream advisory](https://github.com/postcss/postcss/security/advisories/GHSA-fxqj-rqcc-2cmp), patched at 8.5.23 |
| DOMPurify | 3.4.16 | [Upstream advisory](https://github.com/cure53/DOMPurify/security/advisories/GHSA-6688-9rhm-gjv2), patched at 3.4.16 |
| Sass in Payload Next integration | 1.105.1 | [Upstream release](https://github.com/sass/dart-sass/releases/tag/1.105.1); replaces the Sass 1.77.4 → Chokidar 3 → Braces 3.0.3 path |

No `npm audit fix --force` or copied plugin implementation rewrite was used. Exact overrides are visible in `app/package.json` and the installed graph is bound by `app/package-lock.json`.

## Esbuild dependency follow-up — 2026-10-16

The previous published lock recorded five moderate findings, zero high and zero critical. These were one [esbuild advisory](https://github.com/advisories/GHSA-67mh-4wv8-2f99) propagated through five dependency nodes:

`@payloadcms/db-sqlite 3.90.2 → drizzle-kit 0.31.7 → @esbuild-kit/esm-loader 2.6.5 → @esbuild-kit/core-utils 3.3.2 → esbuild 0.18.20`.

This candidate scopes an npm override to core-utils and reuses the already locked esbuild **0.25.12**. Its regenerated lock removes 23 obsolete nested esbuild/platform records and changes no other surviving package record or version. This crosses core-utils' declared `~0.18.20` range; it is a deliberate compatibility tradeoff, not an upstream compatibility guarantee. [The 0.25.0 release](https://github.com/evanw/esbuild/releases/tag/v0.25.0) documents breaking changes.

The advisory concerns the esbuild `serve` development server. A focused synthetic loopback fixture reproduced the old wildcard CORS header and observed its absence with the resolved patched version. Existing core-utils synchronous/asynchronous TypeScript transforms and invalid-input rejection passed. Fresh Linux locked installation, schema initialization, plugin/production builds, typecheck, 12 lifecycle guards, 25 API checks, eight additional boundary checks, two reference checks and three controlled-restart checks passed. This app starts neither esbuild `serve` nor Drizzle Studio; these checks do not claim that the application itself was exploitable through that server.

The candidate's `npm audit --omit=dev --registry=https://registry.npmjs.org --json` exited **0**, with **zero reported findings**, on 2026-10-16. This is a production dependency/advisory snapshot, not a formal security audit or assurance about future advisories. The override's focused scope, exact tested files and remaining limits are recorded in [DEPENDENCY-VERIFICATION.json](DEPENDENCY-VERIFICATION.json). The follow-up candidate has not run on GitHub CI; the earlier successful run covers only its linked published head.

## Report a problem

Use this repository's GitHub Issues for reproducible problems with synthetic data.
Include the tested commit, steps, expected behavior, and actual result. Do not post
credentials, customer data, private documents, real logs, or personal information.
For a security concern, use GitHub's private vulnerability reporting if this
repository offers it. If no private channel is available, open only a neutral
request for a private reporting channel; keep exploit details and affected data private.
