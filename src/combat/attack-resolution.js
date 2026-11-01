import { randomInt } from "node:crypto";
import { rollD20 } from "../rules/dice.js";
function validateInteger(value,name,min=-100,max=100){if(!Number.isInteger(value)||value<min||value>max)throw new RangeError(`${name} inválido.`);}
function parseDice(expression){
 if(typeof expression!=="string")throw new TypeError("damageDice debe ser texto.");
 const m=/^(\d{1,2})d(\d{1,3})([+-]\d{1,3})?$/.exec(expression.trim());
 if(!m)throw new TypeError("Formato de daño inválido; usa, por ejemplo, 1d8+3.");
 const count=Number(m[1]),sides=Number(m[2]),modifier=Number(m[3]??0);
 if(count<1||count>20||sides<2||sides>100)throw new RangeError("Dados de daño fuera de límites.");
 return {count,sides,modifier};
}
function rollDamage(expression,{critical=false,randomDie=s=>randomInt(1,s+1)}={}){
 const p=parseDice(expression),count=p.count*(critical?2:1);
 const rolls=Array.from({length:count},()=>{const v=randomDie(p.sides);if(!Number.isInteger(v)||v<1||v>p.sides)throw new RangeError("Fuente de daño inválida.");return v;});
 return {rolls,total:Math.max(0,rolls.reduce((a,b)=>a+b,0)+p.modifier),modifier:p.modifier,diceCount:count,sides:p.sides};
}
export function resolveAttack({attackBonus,targetArmorClass,damageDice,advantage=false,disadvantage=false,randomD20,randomDamageDie}){
 validateInteger(attackBonus,"attackBonus");validateInteger(targetArmorClass,"targetArmorClass",0,100);
 if(typeof advantage!=="boolean"||typeof disadvantage!=="boolean")throw new TypeError("Ventaja y desventaja deben ser booleanas.");
 const mode=advantage===disadvantage?"normal":advantage?"advantage":"disadvantage";
 const d20=rollD20({mode,...(randomD20?{randomD20}:{})});
 const critical=d20.kept===20,automaticMiss=d20.kept===1,total=d20.kept+attackBonus;
 const hit=critical||(!automaticMiss&&total>=targetArmorClass);
 const damage=hit?rollDamage(damageDice,{critical,...(randomDamageDie?{randomDie:randomDamageDie}:{})}):null;
 return Object.freeze({hit,critical,automaticMiss,attackRoll:d20.rolls,keptD20:d20.kept,attackBonus,total,targetArmorClass,damage});
}