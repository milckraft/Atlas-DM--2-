# Rogue feature runtime — Player's Handbook 2024

This module implements deterministic feature calculations and eligibility for selected Rogue features using the supplied Spanish Player's Handbook 2024 (pp. 170–171).

Implemented helpers:
- Cunning Action option validation (level 2).
- Steady Aim activation condition (level 3).
- Uncanny Dodge damage reduction and reaction consumption (level 5).
- Evasion damage resolution, including the incapacitated exception (level 7).
- Reliable Talent d20 floor for proficient checks (level 7).
- Slippery Mind saving throw proficiencies (level 15).
- Elusive attack-advantage rule (level 18).
- Stroke of Luck conversion and recharge marker (level 20).
- Cunning Strike save DC formula.

The combat/session layer must still own action economy, movement, attack consumption, reactions, conditions, rests and turn boundaries. These helpers do not make the Rogue class playable by themselves. Subclasses, full equipment/mastery integration, level advancement and complete class feature coverage remain pending.

Source: Player's Handbook 2024, Spanish edition, chapter 3, Rogue class, pp. 170–171. Descriptive summaries only; no rulebook prose reproduced.
