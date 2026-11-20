// V0.3 compound Boolean engine, independent of DOM
(function(root){
"use strict";
function evalExpr(e,v){if(Number.isInteger(e)){if(e<0||e>=v.length)throw Error("variable");return v[e]}if(!Array.isArray(e))throw Error("expression");let [op,a,b]=e;if(op==="not"&&e.length===2)return 1-evalExpr(a,v);if(e.length!==3)throw Error("arity");let x=evalExpr(a,v),y=evalExpr(b,v);switch(op){case "and":return x&y;case "or":return x|y;case "xor":return x^y;case "imp":return (1-x)|y;default:throw Error("operator")}}
function solve(r,ids=r.map((_,i)=>i)){if(r.length<1||r.length>12)throw Error("size");let count=0,witness=null;for(let m=0;m<2**r.length;m++){let v=r.map((_,i)=>(m>>i)&1);if(ids.every(i=>v[i]===evalExpr(r[i],v))){count++;witness??=v}}return {count,witness}}
function core(r){if(solve(r).count)return null;let ids=r.map((_,i)=>i);for(let i of [...ids]){let t=ids.filter(j=>j!==i);if(!solve(r,t).count)ids=t}return ids}
function rng(seed){let x=seed>>>0;return ()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296}}
function search(seed,budget,adaptive){let random=rng(seed),pick=n=>Math.floor(random()*n),ops=["and","or","xor","imp"],expr=n=>[ops[pick(4)],pick(n),pick(n)],archive=new Map();for(let i=0;i<budget;i++){let parents=[...archive.values()],r;if(adaptive&&parents.length&&random()<.8){r=JSON.parse(JSON.stringify(parents[pick(parents.length)].r));r[pick(r.length)]=expr(r.length)}else{let n=2+pick(5);r=Array.from({length:n},()=>expr(n))}let c=solve(r).count,m=c?0:core(r).length,self=r.filter((e,j)=>e.slice(1).includes(j)).length,key=[r.length,c?1:0,self].join(":"),score=c?Math.log2(c):m;let old=archive.get(key);if(!old||score>old.score)archive.set(key,{r,score})}return {coverage:archive.size,archive:[...archive.entries()]}}
root.ParadoxV3={evalExpr,solve,core,search};
})(typeof globalThis!=="undefined"?globalThis:this);
