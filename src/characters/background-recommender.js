import { listBackgroundEntries } from "./background-catalogue.js";
const KEYWORDS={
acolyte:["templo","religion","sacerdote","dios","fe","oracion","culto"],entertainer:["musica","cantar","baile","actor","escenario","artista"],
artisan:["forja","herrero","artesano","fabricar","oficio"],farmer:["granja","campo","cultivo","animales","ganado"],
charlatan:["estafa","falsificar","engaño","identidad falsa","timador"],merchant:["comercio","mercader","negocio","caravana","mercado"],
criminal:["ladron","robar","contrabando","calle","gremio criminal","cerraduras"],hermit:["ermitaño","aislado","soledad","retiro","meditar"],
sage:["estudio","investigacion","academia","magia","biblioteca","conocimiento"],scribe:["escriba","archivo","documentos","escritura","copista"],
guard:["guardia","vigilancia","patrulla","proteccion","ley"],guide:["explorador","bosque","rastrear","viajar","mapas","frontera"],
sailor:["mar","barco","navegar","marinero","puerto","tripulacion"],noble:["noble","aristocrata","corte","linaje","palacio","herencia"],
soldier:["ejercito","batalla","guerra","militar","campaña","veterano"],wayfarer:["vagabundo","supervivencia","callejero","viajero","huerfano","sin hogar"]};
const AFFINITY={barbarian:["farmer","soldier","wayfarer"],bard:["entertainer","noble","charlatan"],cleric:["acolyte","hermit","sage"],druid:["hermit","guide","farmer"],fighter:["soldier","guard","noble"],monk:["hermit","acolyte","wayfarer"],paladin:["acolyte","noble","soldier"],ranger:["guide","wayfarer","sailor"],rogue:["criminal","charlatan","wayfarer"],sorcerer:["sage","hermit","noble"],warlock:["hermit","sage","charlatan"],wizard:["sage","scribe","acolyte"]};
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
export function recommendBackgrounds({story="",classId=null,skills=[],abilities={}}={}){
 const t=norm(story),skillSet=new Set(skills.map(norm));
 return listBackgroundEntries().map(e=>{let score=0,reasons=[];
 for(const k of KEYWORDS[e.id]??[])if(t.includes(norm(k))){score+=3;reasons.push(`La historia menciona «${k}»`);}
 if(AFFINITY[classId]?.includes(e.id)){score+=2;reasons.push("Afinidad temática con la clase");}
 for(const s of e.skills)if(skillSet.has(norm(s))){score++;reasons.push(`Coincide con ${s}`);}
 const high=e.abilityChoices.filter(a=>Number(abilities[a])>=13);
 if(high.length>=2){score++;reasons.push("Permite aumentar características destacadas");}
 return{id:e.id,name:e.name,score,reasons,confidence:score>=8?"alta":score>=4?"media":"baja"};
 }).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,"es")).slice(0,3);
}