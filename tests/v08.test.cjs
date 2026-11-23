const assert=require('assert');
require('../engine-v06.js');require('../engine-v07.js');require('../engine-v08.js');
const p=globalThis.ParadoxLab06,q=globalThis.ParadoxLab08;
const records=[
{modelId:'A',challengeId:'c1',family:'self-ref',valid:false,error:'MISSED_UNSAT'},
{modelId:'A',challengeId:'c1',family:'self-ref',valid:false,error:'MISSED_UNSAT'},
{modelId:'A',challengeId:'c2',family:'nested',valid:true},
{modelId:'B',challengeId:'c1',family:'self-ref',valid:false,error:'MISSED_UNSAT'},
{modelId:'B',challengeId:'c1',family:'self-ref',valid:false,error:'MISSED_UNSAT'},
{modelId:'B',challengeId:'c2',family:'nested',valid:false,error:'FORMAT'},
{modelId:'B',challengeId:'c2',family:'nested',valid:true}
];
assert.equal(q.stableFailure(records.slice(0,2),2).error,'MISSED_UNSAT');
assert.equal(q.stableFailure(records.slice(2,3),2),null);
const fp=q.fingerprint('A',records.filter(x=>x.modelId==='A'));
assert.equal(fp.total.trials,3);assert.equal(fp.families['self-ref'].stableFailure.error,'MISSED_UNSAT');
const tm=q.transferMatrix(records);
assert.equal(tm.pairwise['A->B'].transferRate,1);
assert.equal(tm.pairwise['B->A'].transferRate,1);
(async()=>{
 const adapter=async()=>({status:'UNSAT',core:[0]});
 const suite=await q.runSuite(adapter,[{id:'self',family:'self-ref',rules:[['not',0]]}],{modelId:'mock',repeats:3});
 assert.equal(suite.records.length,3);assert.equal(suite.fingerprint.total.accuracy,1);
 const minimized=await q.minimizeStable([['not',0],['and',1,1]],async()=>({status:'UNSAT',core:[0]}),{repeats:2});
 assert.equal(p.solve(minimized.rules).sat,false);assert(minimized.adapterCalls>0);
 console.log('V0.8 tests passed');
})().catch(e=>{console.error(e);process.exit(1)});
