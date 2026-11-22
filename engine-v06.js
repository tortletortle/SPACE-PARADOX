// V0.6 provider-neutral deterministic evaluation harness
(function(root) {
"use strict";
function ev(e,v) {
 if(Number.isInteger(e)) return v[e];
 const op=e[0], a=ev(e[1],v);
 if(op==="not") return 1-a;
 const b=ev(e[2],v);
 if(op==="and") return a&b;
 if(op==="or") return a|b;
 if(op==="xor") return a^b;
 if(op==="imp") return (1-a)|b;
 throw Error("unknown operator");
}
function solve(r,ids) {
 ids=ids||r.map((_,i)=>i);
 let count=0,witness=null;
 for(let m=0;m<Math.pow(2,r.length);m++){
  const v=r.map((_,i)=>(m>>i)&1);
  if(ids.every(i=>v[i]===ev(r[i],v))){count++;if(witness===null)witness=v;}
 }
 return {sat:count>0,count,witness};
}
function core(r) {
 if(solve(r).sat)return null;
 let ids=r.map((_,i)=>i);
 for(const i of ids.slice()){const next=ids.filter(j=>j!==i);if(!solve(r,next).sat)ids=next;}
 return ids;
}
function validate(r,a) {
 if(typeof a==="string"){try{a=JSON.parse(a)}catch(e){return {valid:false,error:"FORMAT"}}}
 if(!a||!["SAT","UNSAT"].includes(a.status))return {valid:false,error:"FORMAT"};
 const sat=solve(r).sat;
 if((a.status==="SAT")!==sat)return {valid:false,error:sat?"FALSE_UNSAT":"MISSED_UNSAT"};
 if(sat){
  if(!a.assignment||r.some((_,i)=>![0,1].includes(a.assignment["X"+i])))return {valid:false,error:"INCOMPLETE_ASSIGNMENT"};
  const v=r.map((_,i)=>a.assignment["X"+i]);
  return r.every((e,i)=>v[i]===ev(e,v))?{valid:true}:{valid:false,error:"INVALID_ASSIGNMENT"};
 }
 if(!Array.isArray(a.core)||!a.core.length||a.core.some(i=>!Number.isInteger(i)||i<0||i>=r.length)||new Set(a.core).size!==a.core.length)return {valid:false,error:"INVALID_CORE"};
 return solve(r,a.core).sat?{valid:false,error:"CORE_NOT_UNSAT"}:{valid:true,minimalCore:core(a.core.map(i=>r[i]))};
}
function makeChallenge(r,id){return {id:id||"local",semantics:"classical Boolean fixed-point equations; all equations hold simultaneously",rules:r.map((e,i)=>"X"+i+" = "+JSON.stringify(e)),variables:r.map((_,i)=>"X"+i),required:"JSON: SAT with complete assignment, or UNSAT with zero-based unsatisfiable rule indices"};}
function makePrompt(c){return "Solve exactly under the stated classical Boolean semantics. Do not modify rules. Return JSON only.\n"+JSON.stringify(c);}
function summarize(rows){const errors={};for(const x of rows)if(x.error)errors[x.error]=(errors[x.error]||0)+1;const ok=rows.filter(x=>x.valid).length;return {trials:rows.length,valid:ok,accuracy:rows.length?ok/rows.length:null,errors};}
root.ParadoxLab06={ev,solve,core,validate,makeChallenge,makePrompt,summarize};
})(globalThis);
