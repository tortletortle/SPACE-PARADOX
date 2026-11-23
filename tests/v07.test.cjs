const assert=require('assert');
require('../engine-v06.js');require('../engine-v07.js');
const p=globalThis.ParadoxLab06,q=globalThis.ParadoxLab07;
const rules=[['imp',['not',0],['and',1,2]],['xor',1,2],['or',0,2]];
for(const v of q.variants(rules,42)){assert.equal(p.solve(v.rules).sat,p.solve(rules).sat);for(let i=0;i<rules.length;i++)assert.equal(p.solve([v.rules[i],...rules.slice(1).filter((_,j)=>j!==i)]).sat,p.solve([rules[i],...rules.slice(1).filter((_,j)=>j!==i)]).sat);}
assert.equal(q.equivalent(['imp',0,1],['or',['not',0],1],2),true);
assert.equal(q.equivalent(['and',0,1],['or',0,1],2),false);
(async()=>{const base=[['not',0],['and',1,1]];const out=await q.minimize(base,r=>!p.solve(r).sat);assert.equal(p.solve(out.rules).sat,false);assert(out.checks>0);console.log('V0.7 tests passed; minimization checks:',out.checks)})().catch(e=>{console.error(e);process.exit(1)});
