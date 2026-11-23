// Example local runner. Keep this process on a trusted machine.
require("./engine-v06.js");
require("./engine-v07.js");
require("./engine-v08.js");
require("./engine-v09.js");
const {createOpenAICompatibleAdapter}=require("./adapters/openai-compatible.cjs");
const adapter=createOpenAICompatibleAdapter();
(async()=>{
 const result=await globalThis.ParadoxLab09.investigate(adapter,{
  modelId:process.env.PARADOX_MODEL,
  perItemRepeats:3,
  stableThreshold:2,
  maxCandidates:6,
  maxAdapterCalls:60,
  minimize:true
 });
 require("node:fs").mkdirSync("reports",{recursive:true});
 const path="reports/"+Date.now()+"-model-evaluation.json";
 require("node:fs").writeFileSync(path,globalThis.ParadoxLab09.exportReport(result));
 process.stdout.write("Saved "+path+"\n");
})().catch(e=>{console.error(e.message);process.exitCode=1});
