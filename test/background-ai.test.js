import test from "node:test";
import assert from "node:assert/strict";
import { analyzeCharacterBackground } from "../src/characters/background-ai.js";
import { registerAIProvider } from "../src/ai/provider-registry.js";

test("pide más historia cuando la biografía es demasiado breve",async()=>assert.equal((await analyzeCharacterBackground("Era un ladrón.")).status,"insufficient_story"));
test("valida salida del modelo antes de devolverla",async()=>{
 registerAIProvider("background-test",{narrative:async()=>({summary:"Vida viajera",recommendations:[{backgroundId:"wayfarer",reason:"La biografía describe una vida itinerante.",storyEvidence:["Creció viajando entre pueblos."]}],needsClarification:false,questions:[]})});
 const result=await analyzeCharacterBackground("Creció viajando entre pueblos y aprendió a sobrevivir lejos de casa.",{providerName:"background-test"});
 assert.equal(result.status,"ok");
});
test("rechaza respuestas con trasfondos no catalogados",async()=>{
 registerAIProvider("background-invalid",{narrative:async()=>({summary:"x",recommendations:[{backgroundId:"fake",reason:"x",storyEvidence:["x"]}],needsClarification:false,questions:[]})});
 const result=await analyzeCharacterBackground("Creció viajando entre pueblos y aprendió a sobrevivir lejos de casa.",{providerName:"background-invalid"});
 assert.equal(result.status,"invalid_provider_response");
});
