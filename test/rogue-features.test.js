import test from "node:test";
import assert from "node:assert/strict";
import {
  validateCunningAction, activateSteadyAim, resolveUncannyDodge,
  resolveEvasion, applyReliableTalent, getSlipperyMindSavingThrows,
  canAttackerHaveAdvantageAgainstElusive, resolveStrokeOfLuck,
  calculateCunningStrikeSaveDc
} from "../src/characters/rogue-features.js";

test("Acción astuta accepts only Dash, Disengage or Hide as bonus action", () => {
  assert.equal(validateCunningAction({level:2,option:"dash"}).valid,true);
  assert.equal(validateCunningAction({level:1,option:"dash"}).valid,false);
  assert.equal(validateCunningAction({level:2,option:"attack"}).valid,false);
});
test("Puntería certera requires that the rogue has not moved", () => {
  assert.equal(activateSteadyAim({level:3,hasMovedThisTurn:false}).valid,true);
  assert.equal(activateSteadyAim({level:3,hasMovedThisTurn:true}).reason,"already-moved");
});
test("Esquiva asombrosa consumes reaction and rounds damage down", () => {
  assert.deepEqual(resolveUncannyDodge({level:5,attackerVisible:true,attackHit:true,damage:9,reactionAvailable:true}),
    {canUse:true,damageAfter:4,consumesReaction:true});
});
test("Evasión avoids damage on success and halves it on failure", () => {
  assert.equal(resolveEvasion({level:7,dexteritySaveSucceeded:true,damage:17,incapacitated:false}).damageAfter,0);
  assert.equal(resolveEvasion({level:7,dexteritySaveSucceeded:false,damage:17,incapacitated:false}).damageAfter,8);
  assert.equal(resolveEvasion({level:7,dexteritySaveSucceeded:true,damage:17,incapacitated:true}).damageAfter,8);
});
test("Talentos fiables turns proficient d20 results of 9 or lower into 10", () => {
  assert.equal(applyReliableTalent({level:7,d20Result:9,isProficient:true}).result,10);
  assert.equal(applyReliableTalent({level:7,d20Result:9,isProficient:false}).result,9);
});
test("Mente escurridiza grants Wisdom and Charisma save proficiency", () => {
  assert.deepEqual(getSlipperyMindSavingThrows(15),["wisdom","charisma"]);
});
test("Elusivo allows advantage only while incapacitated", () => {
  assert.equal(canAttackerHaveAdvantageAgainstElusive({level:18,incapacitated:false}),false);
  assert.equal(canAttackerHaveAdvantageAgainstElusive({level:18,incapacitated:true}),true);
});
test("Golpe de suerte changes a failed d20 test to 20 and consumes its use", () => {
  assert.deepEqual(resolveStrokeOfLuck({level:20,d20TestFailed:true,available:true}),
    {applied:true,d20Result:20,consumesUse:true,recharge:"short-or-long-rest"});
});
test("Golpe astuto save DC uses Dexterity and proficiency", () => {
  assert.equal(calculateCunningStrikeSaveDc({dexterityScore:16,rogueLevel:5}),14);
});
