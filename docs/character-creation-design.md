# Character creation pipeline

This document records Atlas DM's implementation plan for the 2024 Player's Handbook character-creation flow. It is a project design document, not a reproduction of the rulebook.

## Guided sequence

1. Choose a class.
2. Define origin: choose a background, species, and languages.
3. Determine the six ability scores.
4. Choose alignment.
5. Complete derived details and equipment.

The application should support conversational input as well as guided prompts. Players may describe a character concept in natural language; Atlas proposes matching official options and asks the player to confirm before applying mechanical effects.

## Mechanical boundaries

- Background data owns its ability-score improvement choices, origin feat, two skill proficiencies, one tool proficiency, and equipment choice.
- Species data owns creature type, size, speed, and species traits.
- Class data owns hit die, primary ability, saving-throw proficiencies, skill choices, armor and weapon training, starting equipment, and level progression.
- Ability scores, proficiency, hit points, armor class, spellcasting, and other derived values must be calculated by deterministic code.
- AI narration may explain choices but cannot invent or silently alter mechanical values.
- Store source identifiers and rules-version metadata with catalogue entries.
- Never copy rulebook descriptions or illustrations into the repository. Store concise original summaries and the mechanical fields needed by the engine.

## Catalogue status

No complete class, background, species, feat, equipment, or spell catalogue is declared complete yet. Each entry must be checked against the supplied 2024 Player's Handbook before being marked verified.

## Persistence and audit

Character drafts are separate from confirmed characters. A player must confirm the proposed character before it becomes active. Keep a change history for level-ups and player-approved edits.
