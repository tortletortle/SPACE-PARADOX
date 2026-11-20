(function(root){"use strict";
function run(seed,budget,{rate=.8,resize=false,neutral=false}={}){
let x=seed>>>0,rand=()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296},pick=n=>Math.floor(rand()*n),ops=["and","or","xor","imp"],expr=n=>[ops[pick(4)],pick(n),pick(n)],archive=new Map(),solver=root.ParadoxV3;
for(let i=0;i<budget;i++){let parents=[...archive.values()],r;
if(parents.length&&rate>0&&rand()<rate){r=JSON.parse(JSON.stringify(parents[pick(parents.length)].r));if(resize&&rand()<.35){if(r.length===2||(r.length<6&&rand()<.5))r.push(expr(r.length+1));else{let removed=r.length-1;r.pop();r=r.map(e=>e.map((v,j)=>j&&v===removed?pick(r.length):v))}}r[pick(r.length)]=expr(r.length)}else{let n=2+pick(5);r=Array.from({length:n},()=>expr(n))}
let c=solver.solve(r).count,self=r.filter((e,j)=>e.slice(1).includes(j)).length,key=[r.length,c?1:0,self].join(":"),score=c?Math.log2(c):solver.core(r).length,previous=archive.get(key);if(!previous||(!neutral&&score>previous.score))archive.set(key,{r,score})}
return {coverage:archive.size,archive:[...archive]}}
root.ParadoxV4={run};
})(globalThis);
