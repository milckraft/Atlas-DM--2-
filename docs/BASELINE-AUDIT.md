# Atlas DM — Baseline Audit

**Audit date:** 2026-11-02  
**Repository:** `milckraft/Atlas-DM--2-`

## Protected Git snapshots

- `safety/pre-task9-2026-11-02` is identical to `main` at baseline commit `7d64618bef817cfa0441a787c54701e65b931315`.
- `safety/pre-task9-pr1-2026-11-02` preserves the open PR #1 head branch `feature/character-checks-discord`.
- `development/task9-safe-integration` is based on the main safety snapshot and contains the preservation-first integration plan.
- `main` has not been changed by this audit.

## Runtime data warning

The campaign store defaults to `./data/campaigns` (or `ATLAS_DATA_DIR` when configured) and reads/writes campaign JSON files there. The repository tree inspected for this audit did not contain a tracked `data/campaigns` directory or campaign JSON records.

A Git branch protects tracked source history; it does **not** back up campaign files stored on a hosting machine, a mounted volume, or another external path. Before changing hosting, storage paths, or persistence code, locate the actual `ATLAS_DATA_DIR` and make a separate copy of every campaign JSON file. Do not upload `.env`, Discord tokens, API keys, or other secrets to GitHub.

## Current test commands

The repository defines:
- `npm run check` — syntax-checks JavaScript files in `src` and `test`.
- `npm test` — runs the Node.js test suite with `node --test`.

These commands have **not** been executed as part of this remote repository audit. The inspected commit had no reported status checks, so no passing test result is claimed. Run both commands in a clean checkout of the baseline and record their output before source refactors.

## Open PR #1 review scope

PR #1, `Integrate character skill checks into Discord`, is a draft PR against `main`. Its head is `feature/character-checks-discord` at `0a991f3bda16a9d70d3fc14c8cd7445451baa526`. It changes:
- `src/commands/registry.js`
- `src/index.js`
- adds `test/campaign-character-flow.test.js`

The PR adds a campaign character roster, active-character selection and skill-check commands, plus an integration test. It does not complete the full character creation flow. Its branch is separately preserved by `safety/pre-task9-pr1-2026-11-02`.

The PR code should be tested in a clean checkout before merging. Review should specifically verify player ownership, character-schema compatibility, skill identifier normalization, campaign event validation, Discord command output formatting, and behavior when a user has no active character.

## Important limitation

No live hosting filesystem or external database was inspected. The remote Git repository alone cannot prove that all production campaign data has been backed up. Storage migration remains blocked until the actual data location and a verified backup are confirmed.
