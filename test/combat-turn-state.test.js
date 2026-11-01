import test from "node:test";
import assert from "node:assert/strict";
import {
  createCombatTurnState, startCombatTurn, spendTurnResource, moveDuringTurn,
  activateSteadyAimInTurn, consumeSteadyAimAttack, markSneakAttackUsed,
  rechargeStrokeOfLuck, consumeStrokeOfLuck
} from "../src/combat/turn-state.js";

test("turn starts with one action, bonus action, reaction and full movement", () => {
  const s = createCombatTurnState({movementSpeed:30});
  assert.deepEqual([s.actionAvailable,s.bonusActionAvailable,s.reactionAvailable,s.movementRemaining],[true,true,true,30]);
});
test("each action-economy resource can be spent only once per turn", () => {
  let s=createCombatTurnState();
  for(const resource of ["action","bonusAction","reaction"]) {
    const a=spendTurnResource(s,resource); assert.equal(a.spent,true); s=a.state;
    assert.equal(spendTurnResource(s,resource).spent,false);
  }
});
test("movement cannot exceed speed and resets at next turn", () => {
  let s=createCombatTurnState({movementSpeed:25});
  assert.equal(moveDuringTurn(s,26).moved,false);
  s=moveDuringTurn(s,10).state; assert.equal(s.hasMovedThisTurn,true);
  s=startCombatTurn(s); assert.equal(s.movementRemaining,25); assert.equal(s.hasMovedThisTurn,false);
});
test("Steady Aim spends bonus action, requires no movement and sets speed to zero", () => {
  let s=createCombatTurnState({movementSpeed:30});
  s=moveDuringTurn(s,5).state;
  assert.equal(activateSteadyAimInTurn(s,3).reason,"already-moved");
  s=createCombatTurnState({movementSpeed:30});
  const result=activateSteadyAimInTurn(s,3);
  assert.equal(result.activated,true); assert.equal(result.state.movementRemaining,0);
  assert.equal(result.state.bonusActionAvailable,false);
  const attack=consumeSteadyAimAttack(result.state);
  assert.equal(attack.grantsAdvantage,true); assert.equal(consumeSteadyAimAttack(attack.state).grantsAdvantage,false);
});
test("Sneak Attack is limited to once per turn and resets next turn", () => {
  let s=createCombatTurnState();
  s=markSneakAttackUsed(s).state;
  assert.equal(markSneakAttackUsed(s).marked,false);
  assert.equal(markSneakAttackUsed(startCombatTurn(s)).marked,true);
});
test("Stroke of Luck consumes one use and recharges on either rest", () => {
  let s=createCombatTurnState();
  const used=consumeStrokeOfLuck(s,20,true);
  assert.equal(used.applied,true); assert.equal(used.state.strokeOfLuckAvailable,false);
  assert.equal(consumeStrokeOfLuck(used.state,20,true).applied,false);
  assert.equal(rechargeStrokeOfLuck(used.state,"short").strokeOfLuckAvailable,true);
  assert.equal(rechargeStrokeOfLuck(used.state,"long").strokeOfLuckAvailable,true);
});
test("invalid levels and distances are rejected", () => {
  assert.throws(()=>activateSteadyAimInTurn(createCombatTurnState(),2),RangeError);
  assert.throws(()=>moveDuringTurn(createCombatTurnState(),-1),RangeError);
});
