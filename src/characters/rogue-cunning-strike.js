/**
 * Rogue Cunning Strike options from the 2024 Player's Handbook (Spanish edition).
 * Mechanical summaries only; the rules engine resolves rolls and conditions.
 */
export const CUNNING_STRIKE_SOURCE = "2024-phb-es";

const options = {
  retirada: { id:"retirada", name:"Retirada", cost:1, save:null, targetSize:null, requiredTools:[], effect:"Tras el ataque, el pícaro se mueve hasta la mitad de su velocidad sin provocar ataques de oportunidad." },
  tropiezo: { id:"tropiezo", name:"Tropiezo", cost:1, save:"dexterity", targetSize:"large-or-smaller", requiredTools:[], condition:"prone", effect:"El objetivo Grande o más pequeño realiza una salvación de Destreza; si falla, queda derribado." },
  veneno: { id:"veneno", name:"Veneno", cost:1, save:"constitution", targetSize:null, requiredTools:["poisoners-kit"], condition:"poisoned", duration:"1 minute", repeatSave:"end-of-turn", effect:"El objetivo realiza una salvación de Constitución; si falla, queda envenenado durante 1 minuto. Repite la salvación al final de cada turno y termina el efecto si tiene éxito." },
  noquear: { id:"noquear", name:"Noquear", cost:6, save:"constitution", targetSize:null, requiredTools:[], condition:"unconscious", duration:"1 minute-or-until-damaged", repeatSave:"end-of-turn", effect:"El objetivo realiza una salvación de Constitución; si falla, queda inconsciente durante 1 minuto o hasta recibir daño. Repite la salvación al final de cada turno." },
  ofuscar: { id:"ofuscar", name:"Ofuscar", cost:3, save:"dexterity", targetSize:null, requiredTools:[], condition:"blinded", duration:"until-end-of-next-turn", effect:"El objetivo realiza una salvación de Destreza; si falla, queda cegado hasta el final de su siguiente turno." },
  confundir: { id:"confundir", name:"Confundir", cost:2, minimumLevel:14, save:"constitution", targetSize:null, requiredTools:[], duration:"next-turn", effect:"El objetivo realiza una salvación de Constitución; si falla, en su próximo turno solo podrá moverse, realizar una acción o realizar una acción adicional." }
};

export const CUNNING_STRIKE_OPTIONS = Object.freeze(Object.fromEntries(
  Object.entries(options).map(([id, option]) => [id, Object.freeze({ ...option, requiredTools:Object.freeze([...option.requiredTools]) })])
));

export function getCunningStrikeOption(id) {
  return CUNNING_STRIKE_OPTIONS[id] ?? null;
}

export function validateCunningStrike({ level, sneakAttackDice, effects, carriedTools = [] }) {
  if (!Number.isInteger(level) || level < 5 || level > 20) throw new RangeError("Golpe astuto requiere nivel de pícaro 5 a 20.");
  if (!Number.isInteger(sneakAttackDice) || sneakAttackDice < 1) throw new RangeError("Los dados de Ataque furtivo deben ser un entero positivo.");
  if (!Array.isArray(effects) || effects.length === 0) throw new TypeError("Debes elegir al menos un efecto de Golpe astuto.");
  if (!Array.isArray(carriedTools) || carriedTools.some(tool => typeof tool !== "string")) throw new TypeError("carriedTools debe ser una lista de herramientas transportadas.");

  const maxEffects = level >= 11 ? 2 : 1;
  if (effects.length > maxEffects) return { valid:false, reason:"too-many-effects", maxEffects };
  if (new Set(effects).size !== effects.length) return { valid:false, reason:"duplicate-effect", maxEffects };
  const selected = effects.map(getCunningStrikeOption);
  if (selected.some(option => !option)) return { valid:false, reason:"unknown-effect", maxEffects };
  if (selected.some(option => level < (option.minimumLevel ?? 5))) return { valid:false, reason:"level-too-low", maxEffects };

  const missingTools = [...new Set(selected.flatMap(option => option.requiredTools.filter(tool => !carriedTools.includes(tool))))];
  if (missingTools.length) return { valid:false, reason:"missing-required-tool", missingTools, maxEffects };

  const diceCost = selected.reduce((total, option) => total + option.cost, 0);
  if (diceCost > sneakAttackDice) return { valid:false, reason:"insufficient-sneak-attack-dice", diceCost, sneakAttackDice, maxEffects };
  return { valid:true, maxEffects, effects:selected, diceCost, remainingSneakAttackDice:sneakAttackDice-diceCost, saveDcAbility:"dexterity" };
}
