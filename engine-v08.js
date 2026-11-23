// PARADOX LAB V0.8 — model fingerprints and cross-model transfer
(function(root){
"use strict";
const core=root.ParadoxLab06, metamorphic=root.ParadoxLab07;
if(!core||!metamorphic)throw Error("Load V0.6 and V0.7 engines first");
function stableFailure(rows,minRepeats=2){
 const failures=rows.filter(x=>!x.valid&&x.error);
 if(failures.length<minRepeats)return null;
 const counts={};for(const x of failures)counts[x.error]=(counts[x.error]||0)+1;
 const ranked=Object.entries(counts).sort((a,b)=>b[1]-a[1]);
 return ranked[0][1]>=minRepeats?{error:ranked[0][0],count:ranked[0][1],rate:ranked[0][1]/rows.length}:null;
}
function fingerprint(modelId,records){
 const families={};const items={};
 for(const r of records){
  const family=r.family||"unclassified";(families[family]??=[]).push(r);
  const id=r.challengeId||"unknown";(items[id]??=[]).push(r);
 }
 const summarize=rows=>{const valid=rows.filter(x=>x.valid).length,errors={};for(const x of rows)if(x.error)errors[x.error]=(errors[x.error]||0)+1;
  return {trials:rows.length,valid,accuracy:rows.length?valid/rows.length:null,errorCounts:errors,stableFailure:stableFailure(rows)}};
 const familyStats={};for(const [k,v] of Object.entries(families))familyStats[k]=summarize(v);
 const repeatStats={};for(const [k,v] of Object.entries(items))repeatStats[k]=summarize(v);
 return {modelId,total:summarize(records),families:familyStats,challenges:repeatStats};
}
function transferMatrix(records){
 const models=[...new Set(records.map(x=>x.modelId))],cases=[...new Set(records.map(x=>x.challengeId))],matrix={};
 for(const model of models){matrix[model]={};for(const id of cases){const rows=records.filter(x=>x.modelId===model&&x.challengeId===id);matrix[model][id]=stableFailure(rows,2)||{error:null,count:0,rate:0};}}
 const pairwise={};for(const a of models)for(const b of models)if(a!==b){let both=0,shared=0;for(const id of cases){const x=matrix[a][id],y=matrix[b][id];if(x.error){shared++;if(y.error)both++;}}pairwise[a+"->"+b]={sourceStableFailures:shared,targetAlsoFails:both,transferRate:shared?both/shared:null};}
 return {models,cases,matrix,pairwise};
}
async function runSuite(adapter,items,{modelId="unknown",repeats=3}={}){
 const records=[];
 for(const item of items)for(let trial=0;trial<repeats;trial++){
  const challenge=core.makeChallenge(item.rules,item.id),prompt=core.makePrompt(challenge),started=Date.now();
  try{const raw=await adapter(prompt,{modelId,challenge,trial});const verdict=core.validate(item.rules,raw);
   records.push({modelId,challengeId:item.id,family:item.family||"unclassified",trial,valid:verdict.valid,error:verdict.error||null,latencyMs:Date.now()-started,raw:typeof raw==="string"?raw:JSON.stringify(raw)});
  }catch(e){records.push({modelId,challengeId:item.id,family:item.family||"unclassified",trial,valid:false,error:"ADAPTER_ERROR",message:String(e),latencyMs:Date.now()-started});}
 }
 return {modelId,records,fingerprint:fingerprint(modelId,records)};
}
async function minimizeStable(rules,adapter,{modelId="unknown",repeats=3,minStable=2}={}){
 let calls=0;
 const predicate=async candidate=>{const rows=[];for(let i=0;i<repeats;i++){calls++;try{const c=core.makeChallenge(candidate,"minimize-"+calls),raw=await adapter(core.makePrompt(c),{modelId,trial:i});rows.push(core.validate(candidate,raw));}catch(e){rows.push({valid:false,error:"ADAPTER_ERROR"});}}
  const f=stableFailure(rows,minStable);return !!f&&f.error!=="ADAPTER_ERROR";};
 const result=await metamorphic.minimize(rules,predicate);
 return {...result,modelId,adapterCalls:calls,warning:"1-minimal under implemented operators; confirm minimized case and parent in a fresh run."};
}
function report(runs){const all=runs.flatMap(x=>x.records),models=[...new Set(all.map(x=>x.modelId))];return {createdAt:new Date().toISOString(),models:fingerprints(models,all),transfer:transferMatrix(all),records:all};}
function fingerprints(models,records){return models.map(id=>fingerprint(id,records.filter(x=>x.modelId===id)));}
root.ParadoxLab08={stableFailure,fingerprint,transferMatrix,runSuite,minimizeStable,report};
})(globalThis);
