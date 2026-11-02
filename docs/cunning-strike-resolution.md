# Cunning Strike resolution

`resolveCunningStrike` resolves selected Rogue 2024 Cunning Strike effects after a confirmed weapon hit.

- It validates level, effect count, duplicate selections, Sneak Attack die budget and carried-tool requirements using the existing option catalogue.
- It calculates the save DC as 8 + Dexterity modifier + proficiency bonus.
- It rolls the relevant target saving throw using an injectable d20 source and returns whether the condition should be applied.
- Retirada returns movement up to half the rogue's speed and does not require a save.
- Tropiezo rejects targets larger than Large before spending dice.
- A selected effect spends its listed Sneak Attack dice even when the target succeeds on its save.
- A miss spends no dice and applies no effect.

The returned outcomes are instructions for the encounter state to apply; this helper does not mutate target conditions, movement, or initiative. The caller must supply the target's actual saving-throw bonuses and persist successful effects. It does not yet connect this cost to the damage dice in `resolveRogueWeaponAttack`; that integration is a separate next step.
