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

## Remaining recorded findings

The follow-up `npm audit --omit=dev` recorded **five moderate findings, zero high and zero critical**. All five share this retained dependency path:

`@payloadcms/db-sqlite 3.90.2 → drizzle-kit 0.31.7 → @esbuild-kit/esm-loader 2.6.5 → @esbuild-kit/core-utils 3.3.2 → esbuild 0.18.20`.

The [esbuild advisory](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99) concerns the esbuild `serve` development server and is patched at 0.25.0. Inspection found core-utils using transform/transformSync. This app starts neither esbuild `serve` nor Drizzle Studio. The inspected native SQLite connect path invokes schema push outside production; the tested production command runs the built Next server. This scopes the demonstrated path but does not remove the installed vulnerable dependency. The audit remains non-clean; no forced compiler override is claimed safe.

Audit counts describe the recorded lock and advisory snapshot, not a promise about future advisories. The portable source passed the fresh application procedure recorded in VERIFICATION.md; the dependency audit was not refreshed. No hosted-deployment security assurance is made.
