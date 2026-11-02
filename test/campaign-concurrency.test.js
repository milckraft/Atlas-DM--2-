import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createCampaignStore } from "../src/campaign/campaign-store.js";
const fixture = (id="race-test", name="Campaign") => ({campaignId:id,name});
test("concurrent campaign creation never overwrites existing data", async()=>{
 const dir=await mkdtemp(join(tmpdir(),"atlas-race-"));
 try {
  const store=createCampaignStore({directory:dir});
  const results=await Promise.allSettled([store.create(fixture("same","First")),store.create(fixture("same","Second"))]);
  assert.equal(results.filter(x=>x.status==="fulfilled").length,1);
  assert.equal(results.filter(x=>x.status==="rejected"&&x.reason.code==="CAMPAIGN_EXISTS").length,1);
  assert.ok(["First","Second"].includes((await store.get("same")).name));
 } finally { await rm(dir,{recursive:true,force:true}); }
});
test("queued saves leave the final complete state readable", async()=>{
 const dir=await mkdtemp(join(tmpdir(),"atlas-save-"));
 try {
  const store=createCampaignStore({directory:dir});
  await store.create(fixture());
  await Promise.all([store.save({...fixture(),status:"paused"}),store.save({...fixture(),status:"completed"})]);
  assert.ok(["paused","completed"].includes((await store.get("race-test")).status));
 } finally { await rm(dir,{recursive:true,force:true}); }
});
