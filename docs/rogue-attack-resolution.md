# Rogue weapon attack resolution

`resolveRogueWeaponAttack` composes the character-derived weapon attack profile, the attack resolver, the 2024 Rogue Sneak Attack eligibility predicate, and the per-combatant turn state.

The caller supplies the facts the engine must establish: weapon properties and proficiency, advantage/disadvantage, whether a qualifying ally is within 5 feet of the target, and whether that ally is incapacitated. This module does not infer positions or line of sight.

- Sneak Attack is added only when the weapon attack hits and eligibility is satisfied.
- A successful application marks the current global combat turn in turn state.
- A miss, an ineligible attack, or an already-used turn does not consume the feature.
- Critical hits double Sneak Attack dice.
- The returned damage total combines weapon damage and Sneak Attack; the weapon's flat ability modifier is not doubled.
- The returned `turnState` must replace the previous state.

The module assumes the caller keeps `combatTurnId` synchronized for every creature's turn using `setCombatTurnContext`. This is necessary because Sneak Attack can occur outside the rogue's own turn. This stage does not yet implement Cunning Strike, reaction-triggered attack scheduling, damage types, resistance, vulnerability, immunity, cover, range, or position validation.
