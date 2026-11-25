import test from 'node:test';
import assert from 'node:assert/strict';
import {hugPose,hugPhase,blinkController} from '../app/3d/interaction.mjs';
import {saveMuseum,readMuseum,availableSlots} from '../app/local-museum.mjs';
test('hug stages and continuous recovery',()=>{
 assert.deepEqual([0,.8,1.2,1.5,2,3,5,6,7].map(hugPhase),
 ['approach','orient','anticipation','contact','embrace','hold','release','recover','idle']);
 assert.equal(hugPose(0).contact,0);assert.equal(hugPose(3).contact,1);assert.equal(hugPose(6).contact,0);
 for(let t=0;t<6.3;t+=.02)assert.ok(hugPose(t).gap>=.42);
});
test('both seeded blink tracks move independently in the first ten seconds',()=>{
 const a=blinkController(193),b=blinkController(764),repeat=blinkController(193);
 let first=false,second=false;
 for(let i=0;i<600;i++){const x=a(i/60),y=b(i/60);assert.equal(x,repeat(i/60));first||=x>.5&&y===0;second||=y>.5&&x===0}
 assert.ok(first&&second);
});
test('local persistence retains photos and ignores session media',()=>{
 let raw;const storage={setItem:(_,v)=>{raw=v},getItem:()=>raw};
 const photo={title:'A',type:'image',src:'data:image/png;base64,abcd'};
 saveMuseum(storage,{name:'Ours',memories:[photo,{type:'video',src:'blob:test'}]});
 assert.deepEqual(readMuseum(storage,{memories:[]}),{name:'Ours',memories:[photo]});
 assert.equal(availableSlots(Array(6)),0);assert.equal(availableSlots([photo]),5);
 assert.throws(()=>saveMuseum({setItem(){throw Error('quota')}},{memories:[]}),/quota/);
});
import {speechChannels,speechFrame} from '../app/3d/speech.mjs';
test('speech samples the current audio time and clears at pause',()=>{
 const source={audio:{currentTime:1,paused:false,readyState:4},frames:[]};
 source.frames[60]=Array(55).fill(.3);
 assert.equal(speechFrame(source)[speechChannels.jawOpen],.3);
 source.audio.paused=true;assert.equal(speechFrame(source),null);
});
import {makeWalkInPlace} from '../app/3d/locomotion.mjs';
test('root travel is removed while gait height and lateral sway survive',()=>{
 const track={times:[0,.5,1],values:[.1,.9,-1.2,.08,.93,-.58,0,.9,0]};
 makeWalkInPlace(track,[0,.9,0]);
 assert.ok(Math.abs(track.values[2])<1e-8&&Math.abs(track.values[8])<1e-8);
 assert.ok(Math.abs(track.values[3]-.03)<1e-8);assert.equal(track.values[4],.93);
});
