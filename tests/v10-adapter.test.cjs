const assert=require("node:assert/strict");
const {createOpenAICompatibleAdapter}=require("../adapters/openai-compatible.cjs");
(async()=>{
 assert.throws(()=>createOpenAICompatibleAdapter({model:"m",fetch:async()=>{}}),/PARADOX_API_KEY/);
 let request;
 const adapter=createOpenAICompatibleAdapter({apiKey:"test-secret",model:"test-model",baseURL:"https://example.test/v1",fetch:async(url,opts)=>{request={url,opts};return {ok:true,status:200,text:async()=>JSON.stringify({choices:[{message:{content:JSON.stringify({status:"UNSAT",core:[0]})}}]})}}});
 const answer=await adapter("solve",{});assert.deepEqual(answer,{status:"UNSAT",core:[0]});
 assert.equal(request.url,"https://example.test/v1/chat/completions");
 assert.equal(request.opts.headers.Authorization,"Bearer test-secret");
 assert.equal(JSON.parse(request.opts.body).temperature,0);
 const bad=createOpenAICompatibleAdapter({apiKey:"x",model:"m",fetch:async()=>({ok:false,status:429,text:async()=>"rate limited"})});
 await assert.rejects(()=>bad("x"),/HTTP 429/);
 const malformed=createOpenAICompatibleAdapter({apiKey:"x",model:"m",fetch:async()=>({ok:true,status:200,text:async()=>"{}"})});
 await assert.rejects(()=>malformed("x"),/missing choices/);
 console.log("V1.0 adapter tests passed");
})().catch(e=>{console.error(e);process.exit(1)});
