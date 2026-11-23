// PARADOX LAB V0.7 — metamorphic variants and counterexample minimization
(function(root) {
"use strict";
const core=root.ParadoxLab06;
if(!core) throw Error("Load engine-v06.js before engine-v07.js");
function clone(x){return JSON.parse(JSON.stringify(x));}
function rng(seed){let x=seed>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function transformExpr(e,kind){
 if(Number.isInteger(e)) return e;
 if(e[0]==="not"){
  const a=e[1];
  if(kind==="double-negation")return ["not",["not",clone(a)]];
  if(kind==="de-morgan"&&Array.isArray(a)&&["and","or"].includes(a[0]))return [a[0]==="and"?"or":"and",["not",clone(a[1])],["not",clone(a[2])]];
  return ["not",transformExpr(a,kind)];
 }
 const [op,a,b]=e;
 if(kind==="commute"&&["and","or","xor"].includes(op))return [op,clone(b),clone(a)];
 if(kind==="implication"&&op==="imp")return ["or",["not",clone(a)],clone(b)];
 if(kind==="de-morgan"&&["and","or"].includes(op))return ["not",[op==="and"?"or":"and",["not",clone(a)],["not",clone(b)]]];
 return [op,transformExpr(a,kind),transformExpr(b,kind)];
}
function equivalent(a,b,n){for(let m=0;m<2**n;m++){const v=Array.from({length:n},(_,i)=>(m>>i)&1);if(core.ev(a,v)!==core.ev(b,v))return false;}return true;}
function variants(r,seed=1){const random=rng(seed),kinds=["double-negation","de-morgan","commute","implication"],out=[];for(let i=0;i<r.length;i++)for(const kind of kinds){const before=r[i],after=transformExpr(before,kind);if(JSON.stringify(before)===JSON.stringify(after))continue;if(equivalent(before,after,r.length)){const copy=clone(r);copy[i]=after;out.push({rules:copy,changedRule:i,transformation:kind});}}// deterministic seeded shuffle
 for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
 return out;
}
function simplifyExpr(e){if(Number.isInteger(e))return [];if(e[0]==="not")return [{path:[1],replacement:clone(e[1])},...simplifyExpr(e[1]).map(x=>({path:[1,...x.path],replacement:x.replacement}))];return [{path:[1],replacement:clone(e[1])},{path:[2],replacement:clone(e[2])},...simplifyExpr(e[1]).map(x=>({path:[1,...x.path],replacement:x.replacement})),...simplifyExpr(e[2]).map(x=>({path:[2,...x.path],replacement:x.replacement}))];}
function replaceAt(e,path,value){if(!path.length)return clone(value);const c=clone(e);let p=c;for(let i=0;i<path.length-1;i++)p=p[path[i]];p[path[path.length-1]]=clone(value);return c;}
async function minimize(r,predicate){let current=clone(r),checks=0,changed=true;while(changed){changed=false;
 // Remove a rule's constraint by replacing it with tautology Xi = Xi.
 for(let i=0;i<current.length;i++){const candidate=clone(current);candidate[i]=i;if(JSON.stringify(candidate)===JSON.stringify(current))continue;if(await predicate(candidate)){current=candidate;checks++;changed=true;break;}checks++;}
 if(changed)continue;
 outer:for(let i=0;i<current.length;i++){for(const item of simplifyExpr(current[i])){const candidate=clone(current);candidate[i]=replaceAt(candidate[i],item.path,item.replacement);if(JSON.stringify(candidate)===JSON.stringify(current))continue;if(await predicate(candidate)){current=candidate;checks++;changed=true;break outer;}checks++;}}
 }
 return {rules:current,checks};
}
root.ParadoxLab07={transformExpr,equivalent,variants,minimize};
})(globalThis);
