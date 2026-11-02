import test from "node:test";
import assert from "node:assert/strict";
import { createCampaignState, appendDiceRollEvent } from "../src/campaign/campaign-schema.js";
const fixture=()=>createCampaignState({campaignId:"dice-test",name:"Prueba"});
test("persists a validated normal d20 roll as an engine event",()=>{
 const state=appendDiceRollEvent(fixture(),{actorId:"player-1",rollResult:{mode:"normal",rolls:[13],kept:13}});
 assert.equal(state.events[0].source,"engine"); assert.deepEqual(state.events[0].roll,{mode:"normal",rolls:[13],kept:13});
});
test("persists advantage and disadvantage with the correct kept die",()=>{
 assert.equal(appendDiceRollEvent(fixture(),{actorId:"p",rollResult:{mode:"advantage",rolls:[4,17],kept:17}}).events[0].roll.kept,17);
 assert.equal(appendDiceRollEvent(fixture(),{actorId:"p",rollResult:{mode:"disadvantage",rolls:[4,17],kept:4}}).events[0].roll.kept,4);
});
test("rejects inconsistent or invalid dice results",()=>{
 assert.throws(()=>appendDiceRollEvent(fixture(),{actorId:"p",rollResult:{mode:"advantage",rolls:[4,17],kept:4}}),/no coincide/);
 assert.throws(()=>appendDiceRollEvent(fixture(),{actorId:"p",rollResult:{mode:"normal",rolls:[21],kept:21}}),/no válidos/);
});
