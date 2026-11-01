# Character weapon attack profiles

`buildWeaponAttackProfile` derives a basic weapon attack bonus and damage ability modifier from a character sheet and an explicit weapon descriptor.

- Ranged weapons use Dexterity.
- Melee weapons use Strength unless they have finesse; finesse chooses the higher Strength or Dexterity modifier.
- Proficiency bonus is added only when the caller explicitly supplies `proficient: true`.
- Damage dice are passed through unchanged for the attack resolver.

The caller must provide the weapon's damage dice, whether it is ranged, whether it has finesse, and whether the character is proficient. This module does not infer weapon properties or proficiency from incomplete equipment data.

Not yet covered: versatile weapon selection, thrown weapons' specific ability rules, magic weapon bonuses, two-weapon fighting, ammunition, range, cover, reach, mastery properties, feats, class features, spell attacks, damage types, resistance, vulnerability, immunity, and equipped-item validation. It does not spend actions or reactions and does not apply Sneak Attack.
