# Ever Demand multi-tenant: handover

Last updated: 2026-11-26 by the multi-tenant session. Update this after every milestone, then commit and push.

## State

- Branch `feat/multi-tenant` (worktree `C:\Coding\Worktrees\ever-demand-multi-tenant`), based on `feat/latest-stack`
  (PR #1660, open). Rebase or merge onto `develop` once #1660 merges.
- `DESIGN.md` is a **draft waiting for the owner's answers** to §10. No code has been written yet.

## Next

1. Get the owner's answers to DESIGN.md §10. Write them into §3 / §10 of the design, marked "owner, <date>".
2. Build milestones 1-7 of DESIGN.md §9, one commit (or more) per milestone, with tests green at each one.
3. Open the PR against `develop`. Until #1660 merges, the PR's base is `feat/latest-stack`.

## Toolchain

- Node 26.13.1: `export PATH="/c/nvm/v26.13.1:$PATH"`. pnpm 12.23.
- The core e2e and Playwright setup are in `packages/core/test/e2e` and `e2e/` (see `docs/latest-stack/HANDOVER.md`).
