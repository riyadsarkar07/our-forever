import {useEffect,useRef,useState} from 'react';
export function Voice({api}){
 const session=useRef(null),[status,setStatus]=useState('');
 function stop(){
   const s=session.current;if(!s)return;
   session.current=null;s.abort.abort();s.audio.pause();if(s.url)URL.revokeObjectURL(s.url);
   s.context?.close().catch(()=>{});api.current?.speech(null);
 }
 useEffect(()=>()=>stop(),[]);
 async function play(file){
   stop();
   if(file&&(!file.size||file.size>32*1024*1024||!new Audio().canPlayType(file.type))){setStatus('Choose a supported voice clip up to 32 MB.');return}
   const s={audio:new Audio(),abort:new AbortController()};session.current=s;
   setStatus('Preparing voice…');
   try{
     if(file){
       s.context=new AudioContext();await s.context.resume();
       if(session.current!==s)return;
       s.url=URL.createObjectURL(file);s.audio.src=s.url;
       s.analyser=s.context.createAnalyser();s.analyser.fftSize=512;
       s.context.createMediaElementSource(s.audio).connect(s.analyser);s.analyser.connect(s.context.destination);
       s.samples=new Uint8Array(s.analyser.fftSize);s.envelope=new Float32Array(55);
     }else{
       const response=await fetch('/api/speech',{method:'POST',signal:s.abort.signal});
       if(!response.ok)throw Error();
       const data=await response.json();if(session.current!==s)return;
       s.frames=data.frames;s.audio.src='data:audio/wav;base64,'+data.audio;
     }
     s.audio.onended=()=>{if(session.current===s){stop();setStatus('Finished.')}};
     s.audio.onerror=()=>{if(session.current===s){stop();setStatus('Audio playback unavailable.')}};
     await s.audio.play();if(session.current!==s)return;
     api.current?.speech(s);setStatus(file?'Playing local clip · approximate mouth movement':'Playing synthetic greeting · timed facial animation');
   }catch{if(session.current===s){stop();setStatus(file?'Local audio unavailable.':'Cloud greeting unavailable. You can use a local clip.')}}
 }
 return <section><h3>Spoken memories</h3><label className="field">Local voice clip (stays in this tab)
 <input type="file" accept="audio/*" onChange={e=>{const f=e.target.files[0];e.target.value='';if(f)play(f)}}/></label>
 <button onClick={()=>play(null)}>Play sample Azure greeting</button><button onClick={()=>{stop();setStatus('Stopped.')}}>Stop voice</button>
 <small role="status">{status}</small></section>;
}
