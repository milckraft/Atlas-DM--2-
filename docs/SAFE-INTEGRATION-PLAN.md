# Atlas DM — Safe Integration Plan

**Date:** 2026-11-02  
**Baseline:** `main` at the time `safety/pre-task9-2026-11-02` was created  
**Working branch:** `development/task9-safe-integration`

## Non-negotiable preservation rules

1. Never rewrite or force-push `main`, the safety branch, or an existing contributor branch.
2. Never delete existing character, campaign, rules, catalogue, map, learning, or AI modules as a shortcut.
3. Before changing a persisted schema, write a migration and a rollback/recovery plan.
4. Keep existing JSON campaign files readable until a verified migration to PostgreSQL is complete.
5. Keep open pull requests intact. Review and integrate their changes explicitly; do not silently replace them.
6. Every implementation step must add or update tests and must pass the existing suite.
7. Treat catalogue presence, rules summaries, and executable mechanics as separate statuses.

## Repository baseline observed

### Existing source areas

- `src/ai/`: action intent, AI contracts, prompts, provider registry.
- `src/campaign/`: campaign schema, campaign store, character roster.
- `src/characters/`: ability scores, character creation/schema, classes, species, backgrounds, origin feats, rogue rules and progression.
- `src/combat/`: attack resolution, character attacks, rogue features, turn state.
- `src/commands/`: Discord command registry.
- `src/rules/`: dice, checks and character checks.
- `src/maps/`: map schema, dungeon generation and SVG rendering.
- `src/learning/`: rule catalogue and player learning preferences.
- `src/visual/`: image service.
- `test/`: unit and integration tests for the above systems.

### Character creation

Existing implementation includes a guided character creation domain function, ability-score matrix validation, background ability improvements, species choices, origin feat choices, class skill choices, level-1 HP, proficiency bonus, and derived character data.

Important limitation: the class catalogue explicitly marks full progression, subclasses, and some starting equipment as pending. Class level-one feature entries are summaries, not all executable effects. A catalogue entry is not proof that a mechanic is complete.

### Campaign persistence

The current campaign store persists campaign state as JSON files with atomic replacement and in-process serialized writes. Preserve this format during the transition. PostgreSQL must be introduced additively, with import/export verification and backups before any cutover.

### Open pull request

PR #1, “Integrate character skill checks into Discord”, is open. Its described changes include character roster selection and Discord ability checks. It also explicitly says complete character creation remains unfinished. Review its diff and tests before integration. Do not assume PR changes exist on `main`.

## Safe implementation sequence

### Phase 0 — Baseline and protection

- Preserve the current `main` snapshot in the safety branch.
- Keep the working branch separate from the safety branch.
- Record the current file/test inventory and the status of open PRs.
- Run and record the existing test suite before code changes.
- Inspect all campaign data locations and deployment configuration before storage work.

### Phase 1 — Rules and data integrity

- Define canonical internal identifiers for abilities, skills, tools, languages, conditions, equipment, spells and features.
- Add explicit, tested mappings for legacy identifiers; do not silently rename stored data.
- Keep source/rules-version metadata on catalogue entries.
- Verify each catalogue entry against the licensed/source material available to the project.
- Distinguish statuses such as `catalogued`, `source_verified`, `implemented`, and `tested`.

### Phase 2 — Complete level-1 character creation

- Complete validation and choices for class, species, background, feats, skills, tools, languages and equipment.
- Implement deterministic calculations and executable level-1 features.
- Ensure AI can recommend/explain options but cannot set or alter mechanical values.
- Add draft, review, confirm, ownership and change-history flows.
- Preserve the existing character creation API where possible; use adapters for any necessary evolution.

### Phase 3 — Discord integration

- Integrate and review PR #1 without losing its work.
- Complete the guided `/crear_personaje` flow using the domain service.
- Add safe cancellation/resume and player ownership checks.
- Test the complete flow in a Discord test server before production use.

### Phase 4 — Persistence evolution

- Keep JSON storage operational as a supported legacy adapter.
- Design PostgreSQL schema and versioned migrations.
- Build import/export tools and verify record counts, IDs, relationships and checksums.
- Test restore from backup before considering a cutover.
- Do not delete JSON data after migration; retain it until recovery is proven and explicitly approved.

### Phase 5 — Game systems

- Expand combat, turns, conditions, spells, class resources, rests, equipment, monsters, exploration and progression.
- Keep dice and rules resolution deterministic and testable.
- Connect narration only through validated actions and game-state changes.

### Phase 6 — Edrava and world simulation

- Keep original world canon separate from campaign state changed by player decisions.
- Keep secrets hidden until characters legitimately discover them.
- Record confirmed world changes as events with provenance.
- Allow controlled additions that do not contradict established canon.
- Do not force every plot to revolve around a player character.

## Definition of done

A task is complete only when its behavior is implemented, covered by tests, documented, and compatible with existing saved data. “Present in a catalogue” or “described in a prompt” is not sufficient.

## Recovery policy

If a change fails:
1. Stop further writes.
2. Preserve logs and the failing branch.
3. Restore from the safety branch or a verified data backup.
4. Fix forward on the working branch.
5. Never reset or force-push shared history to hide a failed change.
