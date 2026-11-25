import {speechChannels,speechFrame} from './speech.mjs';
import {Vector3, MathUtils} from 'three';
import {blinkController} from './interaction.mjs';

// Each layer owns distinct channels. Jaw and lip articulation are reserved for audio.
const expressions = {
 neutral: [0,0,0,0], warm: [.25,.08,0,0], happy: [.63,.35,.09,0],
 affectionate: [.38,.19,.12,0], surprised: [.04,0,.45,.4],
 thoughtful: [.04,.06,.18,0], speaking: [.08,.03,.06,0]
};
export function createFace(avatar,index) {
 const blink = blinkController(193+index*571);
 const channels = new Map();
 for(const mesh of avatar.morphs) {
   for(const [name,slot] of Object.entries(mesh.morphTargetDictionary)) {
     if(!channels.has(name)) channels.set(name,[]);
     channels.get(name).push([mesh.morphTargetInfluences,slot]);
   }
 }
 const mapped=Object.entries(speechChannels).filter(([name])=>channels.has(name));
 const missing=Object.keys(speechChannels).filter(name=>!channels.has(name));
 if(missing.length)console.warn('Missing speech morphs',missing.join(', '));
 const head=avatar.rig.bones.find(b=>/head$/i.test(b.name));
 const spine=avatar.rig.bones.find(b=>/spine2$/i.test(b.name));
 const local=new Vector3();
 let headYaw=0, headPitch=0;
 function write(name,target,rate) {
   for(const [values,slot] of channels.get(name)??[]) values[slot]+= (target-values[slot])*rate;
 }
 return (time,dt,target,expression,source) => {
   const [smile,cheek,brow,wide]=expressions[expression]??expressions.neutral;
   const blend=1-Math.exp(-6*dt), eyeBlend=1-Math.exp(-25*dt);
   avatar.root.worldToLocal(local.copy(target));
   const distance=Math.hypot(local.x,local.z);
   const attenuation=Math.min(1,distance/.82);
   const yaw=MathUtils.clamp(Math.atan2(local.x,local.z),-.75,.75)*attenuation;
   const pitch=MathUtils.clamp(Math.atan2(local.y-1.58,distance),-.3,.3);
   const saccade=.034*Math.sin(Math.floor(time*(2.2+index*.17))*12.9898+index);
   const horizontal=MathUtils.clamp((yaw-headYaw)*1.2+saccade,-.43,.43);
   headYaw+=(yaw*.54-headYaw)*(1-Math.exp(-3*dt));
   headPitch+=(pitch*.42-headPitch)*blend;
   if(head){head.rotateY(headYaw);head.rotateX(-headPitch)}
   if(spine){spine.rotateY(headYaw*.18);spine.rotateX(.008*Math.sin(time*1.6+index))}
   const frame=speechFrame(source);
   for(const [name,slot] of mapped)write(name,frame?.[slot]??0,1);
   const lid=blink(time);
   write('browInnerUp',brow,blend);
   for(const side of ['Left','Right']){
     write('eyeBlink'+side,lid,1);
     write('eyeWide'+side,wide,blend);
     write('mouthSmile'+side,smile,blend);
     write('cheekSquint'+side,cheek,blend);
     const inward=side==='Left'?horizontal:-horizontal;
     write('eyeLookIn'+side,Math.max(0,inward),eyeBlend);
     write('eyeLookOut'+side,Math.max(0,-inward),eyeBlend);
     write('eyeLookUp'+side,Math.max(0,pitch-headPitch),eyeBlend);
     write('eyeLookDown'+side,Math.max(0,headPitch-pitch),eyeBlend);
   }
 };
}
