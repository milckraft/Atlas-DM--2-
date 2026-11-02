const RULES=[
{id:"attack",label:"Ataque",ability:"STR",skill:null,dc:null,p:[/\b(ataco|atacar|golpeo|golpear|apuñalo|disparo)\b/]},
{id:"investigate",label:"Investigación",ability:"INT",skill:"investigation",dc:15,p:[/\b(investigo|investigar|examino|examinar|busco pistas|registro)\b/]},
{id:"perception",label:"Percepción",ability:"WIS",skill:"perception",dc:13,p:[/\b(observo|observar|escucho|escuchar|vigilo|detecto|miro alrededor)\b/]},
{id:"stealth",label:"Sigilo",ability:"DEX",skill:"stealth",dc:15,p:[/\b(me escondo|esconderme|ocultarme|avanzo sigilosamente|en silencio|me escabullo)\b/]},
{id:"persuasion",label:"Persuasión",ability:"CHA",skill:"persuasion",dc:15,p:[/\b(persuado|convencer|convenzo|negocio|negociar|calmo)\b/]},
{id:"deception",label:"Engaño",ability:"CHA",skill:"deception",dc:15,p:[/\b(miento|mentir|engaño|engañar|finjo|fingir)\b/]},
{id:"intimidation",label:"Intimidación",ability:"CHA",skill:"intimidation",dc:15,p:[/\b(intimido|intimidar|amenazo|amenazar)\b/]},
{id:"athletics",label:"Atletismo",ability:"STR",skill:"athletics",dc:15,p:[/\b(trepo|escalar|salto|saltar|empujo|nado|nadar)\b/]},
{id:"survival",label:"Supervivencia",ability:"WIS",skill:"survival",dc:15,p:[/\b(rastreo|rastrear|sigo las huellas|busco alimento|orientarme)\b/]},
{id:"sleight_of_hand",label:"Juego de manos",ability:"DEX",skill:"sleight_of_hand",dc:15,p:[/\b(robo|hurtar|bolsillo|desactivo la trampa|abro la cerradura|forzar la cerradura)\b/]}
];
export function detectActionIntent(message){
 if(typeof message!=="string")throw new TypeError("El mensaje debe ser texto.");
 const t=message.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
 if(!t||t.length>1000)return{detected:false,reason:"empty_or_too_long"};
 const matches=RULES.filter(r=>r.p.some(p=>p.test(t)));
 if(!matches.length)return{detected:false,reason:"no_confident_match"};
 if(matches.length>1)return{detected:false,ambiguous:true,candidates:matches.map(({id,label,ability,skill,dc})=>({id,label,ability,skill,dc}))};
 const {id,label,ability,skill,dc}=matches[0];
 return{detected:true,action:{id,label,ability,skill,dc,requiresCheck:dc!==null,checkType:dc===null?"attack_roll":"ability_check"}};
}
export function describeDetectedAction(result){
 if(!result?.detected)return null;
 const a=result.action;
 return a.checkType==="attack_roll"
 ? "⚔️ Detecté tu intención: **Ataque**. Necesito la ficha, el arma y el objetivo para resolverlo correctamente."
 : `🎲 Detecté tu intención: **${a.label}**. Prueba sugerida: **${a.skill}** (${a.ability}), CD provisional **${a.dc}**. Necesito la ficha activa para aplicar modificadores y competencias; todavía no he resuelto la acción.`;
}