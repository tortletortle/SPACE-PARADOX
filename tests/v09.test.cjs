const assert=require('assert');
require('../engine-v06.js');require('../engine-v07.js');require('../engine-v08.js');require('../engine-v09.js');
const p=globalThis.ParadoxLab06,q=globalThis.ParadoxLab09;
assert(q.builtInSeeds().length>=5);
for(const x of q.builtInSeeds())assert.equal(q.validateCandidate(x).expected,p.solve(x.rules).sat?'SAT':'UNSAT');
(async()=>{
 let calls=0;const adapter=async(prompt,ctx)=>{calls++;return {status:'SAT',assignment:{X0:0}}};
 const r=await q.investigate(adapter,{modelId:'mock',items:[{id:'u',family:'self-ref',rules:[['not',0]]}],perItemRepeats:2,stableThreshold:2,maxAdapterCalls:10,minimize:false});
 assert.equal(r.adapterCalls,2);assert.equal(r.ledger[0].stableFailure.error,'MISSED_UNSAT');
 assert.equal(calls,2);assert.equal(JSON.parse(q.exportReport(r)).modelId,'mock');
 const budget=await q.investigate(adapter,{items:[{id:'a',rules:[['not',0]]},{id:'b',rules:[['not',0]]}],perItemRepeats:3,maxAdapterCalls:2,minimize:false});
 assert.equal(budget.adapterCalls,0);assert.equal(budget.haltReason,'adapter-call-budget');
 console.log('V0.9 tests passed');
})().catch(e=>{console.error(e);process.exit(1)});
