import test from "node:test";
import assert from "node:assert/strict";
import { createCampaignState, appendCampaignEvent, confirmLatestPlayerReport } from "../src/campaign/campaign-schema.js";
const base=()=>createCampaignState({campaignId:"campaign-1",name:"Edrava"});
test("only the latest player report is confirmed and records moderator",()=>{
 const first=appendCampaignEvent(base(),{type:"note",summary:"El grupo llegó al puente.",source:"player_reported",actorId:"p1"});
 const second=appendCampaignEvent(first,{type:"note",summary:"La puerta estaba abierta.",source:"player_reported",actorId:"p2"});
 const result=confirmLatestPlayerReport(second,"gm1");
 assert.equal(result.confirmed,true);
 assert.equal(result.state.events[0].source,"player_reported");
 assert.equal(result.state.events[1].source,"confirmed");
 assert.equal(result.state.events[1].confirmedBy,"gm1");
});
test("confirmation without pending player reports changes nothing",()=>{
 const result=confirmLatestPlayerReport(base(),"gm1");
 assert.equal(result.confirmed,false);
 assert.equal(result.state.events.length,0);
});
