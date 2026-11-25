// Only this fixed public sample can incur provider use. Cache successes and cool down failures.
let sample, pending, retryAfter=0;
async function synthesize(key,region){
 const sdk=await import('microsoft-cognitiveservices-speech-sdk');
 const config=sdk.SpeechConfig.fromSubscription(key,region);
 config.speechSynthesisOutputFormat=sdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm;
 const synth=new sdk.SpeechSynthesizer(config,null),frames=[];
 try{
   synth.visemeReceived=(_,event)=>{
     if(!event.animation)return;
     const group=JSON.parse(event.animation);
     if(Number.isInteger(group.FrameIndex)&&group.FrameIndex>=0&&Array.isArray(group.BlendShapes))
       group.BlendShapes.forEach((f,i)=>{if(f.length===55)frames[group.FrameIndex+i]=f});
   };
   const ssml='<speak version="1.0" xml:lang="en-US" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts"><voice name="en-US-JennyNeural"><mstts:viseme type="FacialExpression"/>Welcome to our museum. Every memory here has a story.</voice></speak>';
   let timer;
   const result=await new Promise((resolve,reject)=>{
     timer=setTimeout(()=>reject(Error('Speech timed out')),20000);
     synth.speakSsmlAsync(ssml,resolve,reject);
   }).finally(()=>clearTimeout(timer));
   if(result.reason!==sdk.ResultReason.SynthesizingAudioCompleted||!result.audioData?.byteLength||!frames.length)throw Error('Missing audio or frames');
   return {audio:Buffer.from(result.audioData).toString('base64'),frames};
 }finally{synth.close()}
}
export async function POST(){
 const key=process.env.AZURE_SPEECH_KEY,region=process.env.AZURE_SPEECH_REGION;
 if(!key||!region||Date.now()<retryAfter)return Response.json({error:'Spoken greeting unavailable.'},{status:503});
 try{
   if(!sample){pending??=synthesize(key,region);sample=await pending}
   return Response.json(sample);
 }catch{retryAfter=Date.now()+60000;return Response.json({error:'Spoken greeting unavailable.'},{status:503})}
 finally{pending=null}
}
