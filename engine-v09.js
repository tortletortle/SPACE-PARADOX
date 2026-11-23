// PARADOX LAB V0.9 — autonomous, budgeted research workflow
(function(root){
"use strict";
const p=root.ParadoxLab06,q=root.ParadoxLab07,h=root.ParadoxLab08;
if(!p||!q||!h)throw Error("Load V0.6, V0.7 and V0.8 first");
function builtInSeeds(){
 return [
  {id:"self-negation",family:"self-reference",rules:[["not",0]]},
  {id:"negation-cycle-2",family:"self-reference",rules:[["not",1],["not",0]]},
  {id:"negation-cycle-3",family:"self-reference",rules:[["not",1],["not",2],["not",0]]},
  {id:"xor-self",family:"self-reference",rules:[["xor",0,0]]},
  {id:"nested-implication",family:"nested-rules",rules:[["imp",["not",0],["and",1,2]],["xor",1,2],["or",0,2]]},
  {id:"mixed-cycle",family:"nested-rules",rules:[["and",["not",1],2],["or",0,2],["imp",2,1]]}
 ];
}
function seededVariants(items,limit=24,seed=1){
 const out=[],seen=new Set();
 for(const item of items){for(const v of q.variants(item.rules,seed++)){const sig=JSON.stringify(v.rules);if(seen.has(sig))continue;seen.add(sig);out.push({id:item.id+"-"+v.transformation+"-"+v.changedRule,family:item.family,rules:v.rules,parentId:item.id,transformation:v.transformation});if(out.length>=limit)return out;}}
 return out;
}
function validateCandidate(item){const s=p.solve(item.rules);return {id:item.id,family:item.family,variables:item.rules.length,expected:s.sat?"SAT":"UNSAT",solutionCount:s.count};}
async function investigate(adapter,{modelId="unknown",items,perItemRepeats=3,stableThreshold=2,maxCandidates=24,maxAdapterCalls=300,minimize=true}={}){
 items=items||builtInSeeds();const started=Date.now(),ledger=[];let calls=0,haltReason=null;
 const budgetedAdapter=async(prompt,ctx)=>{if(calls>=maxAdapterCalls)throw Error("BUDGET_EXHAUSTED");calls++;return adapter(prompt,ctx);};
 const candidates=items.slice(0,maxCandidates);
 for(const item of candidates){
  if(calls+perItemRepeats>maxAdapterCalls){haltReason="adapter-call-budget";break;}
  const c=p.makeChallenge(item.rules,item.id),rows=[];
  for(let trial=0;trial<perItemRepeats;trial++){
   try{const raw=await budgetedAdapter(p.makePrompt(c),{modelId,challenge:c,trial});const v=p.validate(item.rules,raw);rows.push({...v,trial});}
   catch(e){rows.push({valid:false,error:String(e).includes("BUDGET_EXHAUSTED")?"BUDGET_EXHAUSTED":"ADAPTER_ERROR",message:String(e),trial});if(String(e).includes("BUDGET_EXHAUSTED"))break;}
  }
  const stable=h.stableFailure(rows,stableThreshold);
  ledger.push({candidate:validateCandidate(item),rows,stableFailure:stable});
 }
 const confirmed=[];
 if(minimize){
  for(const entry of ledger){
   if(!entry.stableFailure||calls+perItemRepeats>maxAdapterCalls)continue;
   const item=candidates.find(x=>x.id===entry.candidate.id);
   const reduced=await h.minimizeStable(item.rules,budgetedAdapter,{modelId,repeats:perItemRepeats,minStable:stableThreshold});
   const verifyRows=[];
   if(calls+perItemRepeats<=maxAdapterCalls){
    const challenge=p.makeChallenge(reduced.rules,item.id+"-minimized");
    for(let trial=0;trial<perItemRepeats;trial++){try{const raw=await budgetedAdapter(p.makePrompt(challenge),{modelId,challenge,trial,freshVerification:true});verifyRows.push({...p.validate(reduced.rules,raw),trial});}catch(e){verifyRows.push({valid:false,error:"ADAPTER_ERROR",message:String(e),trial});}}
   }
   const verified=h.stableFailure(verifyRows,stableThreshold);
   confirmed.push({sourceId:item.id,originalFailure:entry.stableFailure,reducedRules:reduced.rules,minimizerChecks:reduced.checks,verifyRows,verifiedSameError:!!verified&&verified.error===entry.stableFailure.error});
  }
 }
 return {version:"0.9",modelId,startedAt:new Date(started).toISOString(),durationMs:Date.now()-started,adapterCalls:calls,budget:maxAdapterCalls,haltReason,ledger,confirmedFindings:confirmed,limitations:["Findings apply only to tested prompts, model version and decoding configuration.","Stable repeated errors are not proof of a general reasoning defect.","A reduced case is only 1-minimal under implemented operators.","No live model was contacted unless the caller supplied a real adapter."]};
}
function exportReport(result){return JSON.stringify(result,null,2);}
root.ParadoxLab09={builtInSeeds,seededVariants,validateCandidate,investigate,exportReport};
})(globalThis);
