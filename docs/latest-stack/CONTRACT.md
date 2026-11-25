# Ever Demand latest-stack upgrade: shared contract for every lane

The upgrade runs as parallel lanes, one git worktree and branch per lane, all cut from
`feat/latest-stack` at `e3e00b80` (the foundation). The lead merges the lane branches back into
`feat/latest-stack`. This file is the contract every lane follows.

## Foundation already in place (`e3e00b80`)

- pnpm 12.23 workspace. `pnpm-workspace.yaml` lists only upgraded packages. **Add your package(s)
  there** when your package.json is on the new stack. Internal deps use `workspace:*`.
- Node 26.13.1 (`.nvmrc`, `engines`). TypeScript `~6.0.3` everywhere. TypeScript 7 is held back:
  Angular 22 needs `>=6.0 <6.1`, and ts-jest needs `<7`.
- `tsconfig.base.json`: ES2022, `moduleResolution: bundler`, **no `baseUrl`** (deprecated in TS 6;
  `paths` are relative to the tsconfig that declares them), `useDefineForClassFields: false`,
  `experimentalDecorators` and `emitDecoratorMetadata`.
- `packages/common` builds on TS 6 (mongoose 9, typeorm 1). `packages/common-angular` typechecks on
  Angular 22.
- `e2e/` is a Playwright workspace package with one project per app (`e2e/playwright.config.ts`);
  shared helpers are in `e2e/tests/helpers.ts`.
- `tools/ng-standalone-false.mjs <dir>` adds `standalone: false` to NgModule-declared
  components, directives and pipes. Angular 19 made standalone the default.

## Toolchain

- Git Bash: `export PATH="/c/nvm/v26.13.1:$PATH"`. PowerShell: `$env:Path = "C:\nvm\v26.13.1;" + $env:Path`.
  Check that `node -v` prints `v26.13.1` and `pnpm -v` prints `12.23.0`. The default `node` on PATH
  is 24, which is the wrong version.
- The npm registry is a local Verdaccio proxy at `localhost:4873`. It is already configured.
- pnpm 12 blocks install scripts unless the package is listed in `allowBuilds` in
  `pnpm-workspace.yaml`. Add packages you need there (for example a native addon), but keep the list tight.
- pnpm 12 has a `minimumReleaseAge` gate and may add `minimumReleaseAgeExclude` entries to
  `pnpm-workspace.yaml` on its own. That is fine.
- Docker Desktop is running (Linux engine), so `docker run` works.

## Rules

1. **Work only in your own worktree.** Never touch `C:\Coding\ever-demand` or another lane's
   worktree. Don't use `git stash`, because the stash stack is shared with other sessions; make a WIP
   commit instead. Never run `git worktree remove` on a directory that has `node_modules`.
2. **Commit early and often** on your branch. Use Conventional Commits with the package name as scope,
   for example `feat(shop-mobile-expo): ...`. End every message with
   `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. After a meaningful commit, push your branch
   (`git push -u origin <your-branch>`). **Never** open a PR, merge, or push any other branch
   (develop, stage and master included).
3. **Use the latest version of everything you touch.** Check each one with `npm view <pkg> version`
   and its `peerDependencies`. Anything you hold back goes into your lane notes file,
   `docs/latest-stack/<lane>.md`, together with its blocker.
4. **Scope.** Edit only:
   - your own package(s);
   - `e2e/tests/<your-app>/`;
   - `.deploy/<your-app>/`;
   - your notes file;
   - your lines in `pnpm-workspace.yaml` (package entry, `allowBuilds`, `peerDependencyRules`).

   Don't edit `packages/common`, `packages/common-angular`, another app, root `package.json` or
   `tsconfig.base.json`. If you are blocked on one of those, make the smallest change that unblocks you,
   commit it separately with a `(shared)` note in the commit subject, and list it in your report.
   `pnpm-lock.yaml` will conflict between lanes. That is expected: the lead regenerates it at merge.
5. **Leave backend behaviour alone.** The Ever Works fleet keeps merging small fixes into `develop`,
   mostly Stripe payments in core and in shop-mobile-ionic. Keep the logic and tests those fixes add.
   Don't merge `develop` yourself; the lead does that.

## Shared code in the Angular apps

The apps compile `packages/common` and `packages/common-angular` **from source** through tsconfig
paths. Keep it that way, and write each path relative to the tsconfig that declares it:

| Path | Resolves to |
| --- | --- |
| `@modules/server.common/*` | `packages/common/src/*` |
| `@modules/client.common.angular2/*` | `packages/common-angular/src/*` |
| `@pyro/*` | `packages/common/src/@pyro/*` |
| `mongoose` | `packages/common-angular/src/mongoose-placeholder` |
| `typeorm` | `packages/common-angular/src/typeorm-placeholder` |

- **ngx-translate 18 removed `TranslateModule`.** Import `TranslateModule` from
  `@modules/client.common.angular2/locale/translate.module` instead. It is an NgModule shim:
  - `forRoot(config)` maps to `provideTranslateService(config)`;
  - `forChild()` or a plain `TranslateModule` gives only the pipe and directive;
  - `forChild(config)` creates an isolated child service.

  Other API changes:
  - `currentLang` is now a Signal. Use `getCurrentLang()` instead.
  - `setDefaultLang` is now `setFallbackLang`, and `defaultLang` is now `getFallbackLang()`.
  - Loaders go through `provideTranslateLoader(...)` or `provideTranslateHttpLoader({ prefix, suffix })`
    from `@ngx-translate/http-loader` 18. Check the installed `.d.ts` files to confirm the signature.

  `LocaleModule` (inside common-angular's `CommonModule`) no longer creates a root
  `TranslateService`. Each app's own `TranslateModule.forRoot(...)` provides it.
- **Angular 22 build and tests:**
  - Builders are `@angular/build:application` (esbuild) and `@angular/build:dev-server`. Drop custom
    webpack configs, `@angular-builders/*` and `@angular-devkit/build-angular`.
  - Unit tests use `@angular/build:unit-test` with Vitest. Remove Karma, Jasmine, Protractor, tslint
    and codelyzer.
  - Keep the NgModule architecture. A standalone rewrite is fine only where it is the cheaper way to
    replace a dead library.

## Backend contract

Ports and protocols stay as they are, all driven by env vars:

| Service | Endpoint |
| --- | --- |
| socket.io "pyro" RPC (the `common-angular/src/lib/router` client) | `SERVICES_ENDPOINT` `http://localhost:5500`, HTTPS `2087` |
| GraphQL over HTTP | `http://localhost:8443/graphql` |
| GraphQL subscriptions | **graphql-ws** at `ws://localhost:2086/subscriptions` |

- `subscriptions-transport-ws` is dead. Clients use `GraphQLWsLink` (`@apollo/client/link/subscriptions`)
  with `createClient` from `graphql-ws`.
- The GraphQL schema (`packages/core/src/graphql/**/*.graphql`) stays backward compatible, so client
  lanes must not need schema changes. If a client really needs a new field, query or mutation, list it
  in the final report instead of editing core.
- Default admin: `admin@ever.co` / `admin`, created on first API boot.
- Client stack: `@apollo/client` 4 and `apollo-angular` 14, with the matching `graphql` major. The core
  lane picks the `graphql` version and notes it in `docs/latest-stack/core.md`. Clients follow it.
- **Don't start your own API** unless you are the core lane. The lead will tell you (SendMessage) when an
  upgraded API is running at the default ports for e2e runs. Until then, use mocks in unit tests.

## Resource limits on this shared PC

The PC has about 5 GB of free RAM, and other sessions run on it too.

- Before a build or test run, check free RAM with `wmic OS get FreePhysicalMemory` (the value is in KB).
  If it is under about 2.5 GB, wait a few minutes with an until-loop, then run the smallest step you can.
- Run only one heavy command at a time.
- Set these caps:

  | Tool | Cap |
  | --- | --- |
  | Jest | `--maxWorkers=1` and `NODE_OPTIONS=--max-old-space-size=3072` |
  | Vitest | `--maxWorkers=2` |
  | Angular build | `NODE_OPTIONS=--max-old-space-size=4096` |
  | Gradle / Flutter in Docker | one at a time |

- Run anything longer than 2 minutes in the background (`run_in_background`) and wait for its notification.
- When you finish, stop your dev servers and containers. Kill only your own processes, by PID, never by
  image name.

## Definition of done for a lane

- [ ] Your package installs with pnpm and typechecks.
- [ ] Unit tests pass. Add meaningful tests: services, state, critical components.
- [ ] The production build passes.
- [ ] The app boots: the dev server serves and a headless smoke check shows no console errors.
- [ ] e2e specs are written in `e2e/tests/<app>/`. They run green against the API once the lead provides it.
- [ ] Your Dockerfile in `.deploy/<app>/` is updated: `node:26-alpine`, and `npm i -g pnpm@12.23.0`
  (Node 25+ no longer bundles corepack).
- [ ] The notes file `docs/latest-stack/<lane>.md` lists versions, decisions, replaced libraries,
  held-back items, and how to run it.
- [ ] Everything is committed and pushed to your branch.

**Final report** (your last message): what changed; what you verified, with command results
summarised; what is held back and why; what you need from other lanes or from the lead.
