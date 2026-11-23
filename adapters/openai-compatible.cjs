// PARADOX LAB V1.0 — OpenAI-compatible server-side adapter
"use strict";
function createOpenAICompatibleAdapter(options={}) {
 const baseURL=(options.baseURL||process.env.PARADOX_API_BASE_URL||"https://api.openai.com/v1").replace(/\/$/,"");
 const apiKey=options.apiKey||process.env.PARADOX_API_KEY;
 const model=options.model||process.env.PARADOX_MODEL;
 const fetchImpl=options.fetch||globalThis.fetch;
 const timeoutMs=options.timeoutMs||45000;
 if(!apiKey)throw Error("Missing PARADOX_API_KEY");
 if(!model)throw Error("Missing PARADOX_MODEL");
 if(typeof fetchImpl!=="function")throw Error("A fetch implementation is required");
 return async function adapter(prompt,context={}) {
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
  try {
   const response=await fetchImpl(baseURL+"/chat/completions",{
    method:"POST",
    headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json"},
    body:JSON.stringify({
     model,
     messages:[
      {role:"system",content:"You are a formal Boolean constraint solver. Follow the requested JSON output schema exactly. Do not invent or modify rules."},
      {role:"user",content:prompt}
     ],
     temperature:0,
     response_format:{type:"json_object"}
    }),
    signal:controller.signal
   });
   const text=await response.text();
   if(!response.ok)throw Error("Provider HTTP "+response.status+": "+text.slice(0,1000));
   let payload;try{payload=JSON.parse(text)}catch(e){throw Error("Provider returned invalid JSON envelope")}
   const content=payload&&payload.choices&&payload.choices[0]&&payload.choices[0].message&&payload.choices[0].message.content;
   if(typeof content!=="string")throw Error("Provider response missing choices[0].message.content");
   try{return JSON.parse(content)}catch(e){throw Error("Model content is not valid JSON: "+content.slice(0,500))}
  } finally {clearTimeout(timer);}
 };
}
module.exports={createOpenAICompatibleAdapter};
