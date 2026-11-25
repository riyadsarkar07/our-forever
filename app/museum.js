import {batchStaticProps} from './3d/static-props';
import {createFace} from './3d/face';
import {hugDuration,hugPose} from './3d/interaction.mjs';
import * as T from 'three';
import {avatarLoader} from './3d/avatar-loader';
import {rig,capturePose,restorePose,gestureWeight,embrace,holdHands,turn} from './character-rig';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
export const ROOMS=[{name:'Grand entrance',z:15},{name:'Memory hall',z:4},{name:'Surprise suite',z:-14},{name:'Photo wing',z:-26},{name:'Cinema',z:-39},{name:'Music lounge',z:-52},{name:'Starlight terrace',z:-65}];

const palette=[['#efac86','#654b68','#27334d'],['#f7bd9a','#925c65','#372e4a'],['#a7c3c7','#748ba1','#313b4a'],['#f2d1a6','#926a53','#382c2e'],['#e7a5b4','#8e6387','#332747'],['#e9b586','#91644a','#283d3d']];
function canvasTexture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');draw(ctx,w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t}
function picture(i){return canvasTexture(512,384,(c,w,h)=>{const p=palette[i%palette.length],g=c.createLinearGradient(0,0,0,h);p.forEach((x,j)=>g.addColorStop(j/2,x));c.fillStyle=g;c.fillRect(0,0,w,h);c.fillStyle='#ffe1b8';c.beginPath();c.arc(350,125,48,0,Math.PI*2);c.fill();for(let k=0;k<3;k++){c.fillStyle=['#6d586b','#50465b','#332f40'][k];c.beginPath();c.moveTo(0,h);for(let x=0;x<=w;x+=32)c.lineTo(x,205+k*45+Math.sin(x*.019+k*4)*34+Math.cos(x*.043+k)*15);c.lineTo(w,h);c.fill()}c.fillStyle='#211e29';for(let j=0;j<2;j++){let x=229+j*48,y=236+j*10;c.beginPath();c.arc(x,y,15,0,7);c.fill();c.beginPath();c.roundRect(x-17,y+15,34,85,14);c.fill()}c.fillStyle='#fff5dcaa';c.font='18px Georgia';c.textAlign='center';c.fillText('a moment to remember',w/2,h-22)})}
function label(s,sub=''){return canvasTexture(768,256,(c,w,h)=>{c.fillStyle='#241a17';c.fillRect(0,0,w,h);c.strokeStyle='#cda17b';c.lineWidth=5;c.strokeRect(7,7,w-14,h-14);c.fillStyle='#f9d9b5';c.textAlign='center';c.font='54px Georgia';c.fillText(s,w/2,112);c.fillStyle='#d8bba1';c.font='28px Arial';c.fillText(sub,w/2,170)})}
export function createMuseum(el,{preview=false,onSelect,onRoom,onReady,onAvatarStatus}={}){
const scene=new T.Scene();scene.background=new T.Color('#35251f');scene.fog=new T.Fog('#392821',24,60);
const camera=new T.PerspectiveCamera(57,1,.1,120);
const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;renderer.outputColorSpace=T.SRGBColorSpace;el.appendChild(renderer.domElement);
const pmrem=new T.PMREMGenerator(renderer);const env=new RoomEnvironment();const envTarget=pmrem.fromScene(env,.06);scene.environment=envTarget.texture;scene.environmentIntensity=.9;env.dispose();pmrem.dispose();scene.add(new T.HemisphereLight('#fff1e8','#53444b',1.05));const sun=new T.DirectionalLight('#ffd7ac',1.4);sun.position.set(3,8,7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-13;sun.shadow.camera.right=13;sun.shadow.camera.top=17;sun.shadow.camera.bottom=-17;sun.shadow.normalBias=.025;scene.add(sun);scene.add(sun.target);
const mat=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});const wall=mat('#3a2928'),cream=mat('#bca18a'),gold=mat('#c99a61',.29,.68),dark=mat('#261b19'),rose=mat('#8f344b'),leaf=mat('#405441'),seat=mat('#9c7770'),glow=new T.MeshBasicMaterial({color:'#ffca8e'});const targets=[],frames=[];
const box=(w,h,d,x,y,z,m,parent=scene)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
const ball=(r,x,y,z,m,sx=1,sy=1,sz=1,parent=scene)=>{const o=new T.Mesh(new T.SphereGeometry(r,16,12),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;parent.add(o);return o};
const wallTex=canvasTexture(256,256,(c,w,h)=>{c.fillStyle='#a49a93';c.fillRect(0,0,w,h);let seed=11;for(let i=0;i<19000;i++){seed=(seed*16807)%2147483647;let x=seed%w;seed=(seed*16807)%2147483647;let y=seed%h;c.fillStyle=i%2?'#ffffff13':'#00000014';c.fillRect(x,y,1+(i%3),1)}});wallTex.wrapS=wallTex.wrapT=T.RepeatWrapping;wallTex.repeat.set(4,4);wall.map=wallTex;wall.bumpMap=wallTex;wall.bumpScale=.025;
const floorMap=canvasTexture(512,512,(c,w,h)=>{c.fillStyle='#d8c4af';c.fillRect(0,0,w,h);for(let k=0;k<95;k++){c.strokeStyle=k%3?'#8b75652b':'#fff3dd75';c.lineWidth=k%9===0?3:.8;c.beginPath();const a=k*29%h;c.moveTo(0,a);for(let x=0;x<=w;x+=8)c.lineTo(x,a+x*.28+Math.sin(x*.018+k)*22+Math.cos(x*.07+k*2)*5);c.stroke()}c.strokeStyle='#8b7466';c.lineWidth=2;c.strokeRect(1,1,w-2,h-2)});floorMap.wrapS=floorMap.wrapT=T.RepeatWrapping;floorMap.repeat.set(9,52);
const floor=new T.Mesh(new T.PlaneGeometry(14,92),new T.MeshStandardMaterial({map:floorMap,roughness:.24,metalness:.12,envMapIntensity:.85}));floor.rotation.x=-Math.PI/2;floor.position.z=-26;floor.receiveShadow=true;scene.add(floor);
box(.35,4.6,78,-7,2.3,-19,wall);box(.35,4.6,78,7,2.3,-19,wall);box(14,4.6,.35,0,2.3,20,wall);box(5.25,4.6,.42,-4.4,2.3,-10,wall);box(5.25,4.6,.42,4.4,2.3,-10,wall);box(3.6,.8,.42,0,4.2,-10,wall);
for(const x of [-6.78,6.78]){box(.08,.16,29.6,x,.12,-5,glow);box(.1,.08,29.6,x,4.25,-5,glow);for(const z of [8,1,-6,-14,-19])box(.36,4.5,.4,x*.98,2.25,z,cream)}
const ceilingLights=[];
const roof=box(14,.2,78,0,4.7,-19,dark);roof.castShadow=false;for(const z of [16,6,0,-6,-14,-24,-35,-47,-55]){const ring=new T.Mesh(new T.TorusGeometry(1.4,.035,8,64),glow);ring.rotation.x=Math.PI/2;ring.position.set(0,4.45,z);scene.add(ring);const l=new T.PointLight('#ffd2a5',23,10,2);l.position.set(0,3.9,z);scene.add(l);ceilingLights.push(l)}
const names=['Our First Photo','Our First Trip','Little Things','Under The Same Sky','My Favorite Person','Forever Starts Here'];
function plaque(txt,sub,x,y,z,rot,w=2.5,h=.6){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:label(txt,sub),side:T.DoubleSide}));m.position.set(x,y,z);m.rotation.y=rot;scene.add(m);return m}
for(let i=0;i<6;i++){const side=i<3?-1:1,z=5-(i%3)*5.0,group=new T.Group();group.position.set(side*6.78,2.55,z);group.rotation.y=side===-1?Math.PI/2:-Math.PI/2;scene.add(group);box(3.05,2.2,.14,0,0,0,gold,group);box(2.84,1.99,.16,0,0,.04,dark,group);const mesh=new T.Mesh(new T.PlaneGeometry(2.72,1.86),new T.MeshStandardMaterial({map:picture(i),roughness:.85,emissive:'#49322e',emissiveIntensity:.12}));mesh.position.z=.135;mesh.userData.index=i;group.add(mesh);targets.push(mesh);frames.push(mesh);const p=new T.Mesh(new T.PlaneGeometry(2.5,.56),new T.MeshBasicMaterial({map:label(names[i],'OUR STORY  •  0'+(i+1))}));p.position.set(0,-1.48,.13);group.add(p);const l=new T.PointLight('#ffd1aa',15,5,2);l.position.set(side*5.9,3.6,z);scene.add(l);ceilingLights.push(l)}
plaque('Our Memories','THE MOMENTS THAT MADE US',-6.78,4.0,5,Math.PI/2,3.8,.68);plaque('Our Story','A LITTLE WORLD FOR TWO',6.78,4.0,5,-Math.PI/2,3.8,.68);
for(const x of [-1.82,1.82]){box(.1,3.5,.15,x,1.75,-9.73,glow);for(let j=0;j<12;j++)ball(.17,x+(j%2?.12:-.12),.3+j*.28,-9.56,rose)}
const arch=new T.Mesh(new T.TorusGeometry(1.82,.055,10,64,Math.PI),glow);arch.position.set(0,2.05,-9.72);scene.add(arch);for(let j=0;j<=16;j++){const a=j*Math.PI/16;ball(.19,Math.cos(a)*1.9,2.05+Math.sin(a)*1.9,-9.56,rose)}
plaque('Surprise Room','SOMETHING JUST FOR YOU',0,3.95,-10.3,Math.PI,3.4,.55);
// Architectural details, distinct rooms and physical doorways.
const oak=mat('#704d3a',.46),ivory=mat('#e2cbb5',.48),velvet=mat('#6b3348',.85),black=mat('#181821',.85);
const partitions=[10,-10,-20,-33,-46,-59];
for(const z of partitions.filter(z=>z!==-10)){for(const x of [-4.45,4.45])box(5.1,4.6,.38,x,2.3,z,wall);box(3.8,.72,.38,0,4.24,z,cream);for(const x of [-1.95,1.95]){box(.18,3.8,.45,x,1.9,z,gold);box(.45,.15,.55,x,.075,z,ivory)}box(4,.08,.46,0,3.8,z,glow)}
for(const z of [15,9,3,-3,-9,-15,-21,-27,-34,-40,-47,-53])for(const x of [-6.65,6.65]){box(.24,4.3,.25,x,2.15,z,oak);box(.38,.16,.45,x,.12,z,gold);box(.38,.16,.45,x,4.19,z,gold);box(.09,2.9,.14,x,2.22,z+.39,gold)}
for(const x of [-6.76,6.76]){box(.12,.38,78,x,.19,-19,oak);box(.15,.06,78,x,.43,-19,gold);box(.12,.22,78,x,4.24,-19,cream)}
for(const z of [15,4,-14,-26,-39,-52,-65]){const idx=ROOMS.findIndex(r=>r.z===z);plaque(ROOMS[idx].name.toUpperCase(),'OUR FOREVER • '+String(idx+1).padStart(2,'0'),-6.76,3.8,z,Math.PI/2,4.0,.7);box(3.7,.025,7.1,0,.026,z,idx===6?black:velvet);for(const x of [-1.75,1.75])box(.035,.03,6.8,x,.045,z,gold)}
for(let i=0;i<6;i++){const x=i<3?-6.76:6.76,z=-23-(i%3)*3.4;const g=new T.Group();g.position.set(x,2.55,z);g.rotation.y=x<0?Math.PI/2:-Math.PI/2;scene.add(g);box(2.8,2.0,.12,0,0,0,gold,g);const frame=new T.Mesh(new T.PlaneGeometry(2.62,1.82),new T.MeshStandardMaterial({map:picture(i),roughness:.72}));frame.position.z=.075;frame.userData.index=i;g.add(frame);targets.push(frame);frames.push(frame)}
// Decorative lobby, cinema screen, seating and music stage.
for(const x of [-4.2,4.2]){box(1.8,.42,.85,x,.45,15,seat);box(1.8,.68,.22,x,.85,15.38,velvet);box(.14,.4,.85,x-.89,.5,15,gold);box(.14,.4,.85,x+.89,.5,15,gold)}
plaque('A Museum of Us','WELCOME TO YOUR STORY',0,3.5,10.22,0,3.4,.62);
const screen=new T.Mesh(new T.PlaneGeometry(5.4,2.8),new T.MeshBasicMaterial({map:picture(1)}));screen.rotation.y=Math.PI/2;screen.position.set(-6.75,2.65,-39);screen.userData.index=1;scene.add(screen);targets.push(screen);box(.12,3.04,5.65,-6.83,2.65,-39,dark);
for(const z of [-41,-38.7,-36.4])for(const x of [-1.1,1.0,3.1]){box(.86,.42,.8,x,.48,z,velvet);box(.86,.88,.22,x+.35,.85,z,velvet)}
box(3.6,.24,4.8,-4.4,.12,-52,oak);box(.75,.9,2.15,-5.2,.69,-52,black);box(.18,.07,2.05,-4.78,1.16,-52,ivory);for(let i=0;i<15;i++)box(.19,.045,.045,-4.72,1.21,-52.97+i*.14,black);
for(const x of [-5.4,5.4]){box(.65,1.6,.55,x,.8,-55,black);for(const y of [.45,1.15])ball(.22,x,y,-54.7,gold,1,1,.18)}
// Outdoor terrace: open roof, low rail and a starry backdrop.
for(const x of [-6.85,6.85])box(.18,1.1,14,x,.55,-65,gold);
box(14,1.1,.18,0,.55,-71.8,gold);
const sky=new T.Mesh(new T.SphereGeometry(48,28,18),new T.MeshBasicMaterial({color:'#111827',side:T.BackSide}));sky.position.set(0,0,-65);scene.add(sky);
const stars=new Float32Array(420*3);for(let i=0;i<420;i++){let a=i*2.399963, y=.18+(i%70)/70*.8, radius=Math.sqrt(1-y*y)*37;stars[i*3]=Math.cos(a)*radius;stars[i*3+1]=y*37;stars[i*3+2]=-65+Math.sin(a)*radius}const sg=new T.BufferGeometry();sg.setAttribute('position',new T.BufferAttribute(stars,3));scene.add(new T.Points(sg,new T.PointsMaterial({color:'#fff2cf',size:.13,sizeAttenuation:true})));
ball(1.65,12,13,-83,new T.MeshBasicMaterial({color:'#ffeed3'}));for(const x of [-4,4]){box(2.1,.42,.8,x,.5,-66,seat);box(2.1,.62,.14,x,.88,-66.35,oak)}
const surprise=box(3.1,1.0,1.6,0,.5,-17,seat);box(3.2,.12,1.7,0,1.02,-17,gold);for(let i=0;i<3;i++){const x=-.8+i*.8;box(.42,.42,.42,x,1.25,-17,rose);box(.08,.44,.44,x,1.25,-17,gold)}
for(const x of [-5.5,5.5])for(const z of [7,-7,-17]){box(.65,.6,.65,x,.3,z,cream);for(let j=0;j<7;j++){const a=j*2.4;ball(.24,x+Math.sin(a)*.3,.75+j*.09,z+Math.cos(a)*.3,leaf,1,1.8,.8)}}
for(const x of [-4.5,4.5]){box(2.1,.45,.85,x,.5,-8,seat);for(const dx of [-.8,.8])box(.1,.28,.65,x+dx,.2,-8,gold)}
for(let i=0;i<90;i++){const x=Math.sin(i*78.21)*2.7,z=-6-(i*1.37%12);const o=new T.Mesh(new T.CircleGeometry(.065,6),rose);o.rotation.x=-Math.PI/2;o.position.set(x,.015+i%3*.002,z);scene.add(o)}
batchStaticProps(scene);
function avatar(){const root=new T.Group();scene.add(root);return {root}}
const player=avatar(),partner=avatar();let outfit;
function tint(){if(outfit&&player.model)player.model.traverse(o=>{
 if(o.isMesh && /outfit_original|top_shirt/i.test(o.name))o.material?.color?.set(outfit)
})}
player.root.position.set(-.55,0,4.2);partner.root.position.set(.7,0,2.9);player.root.rotation.y=partner.root.rotation.y=Math.PI;
// Production character pipeline: same-origin assets first, pinned CDN second.
// No spherical placeholder characters are rendered if an asset is unavailable.
const keys=new Set(),clock=new T.Clock(),ray=new T.Raycaster(),mouse=new T.Vector2();let yaw=0,drag=null,raf=0,disposed=false,room=false,zone='',action='',until=0,actionStart=0,hugPlan=null,quality='medium',readyCount=0,failed=0;
const loader=avatarLoader();
const modelUrls=[['/assets/avatars/arjun-v4.glb'],['/assets/avatars/priya-v4.glb']];
const avatars=[player,partner],velocity=new T.Vector3(),intent=new T.Vector3(),upAxis=new T.Vector3(0,1,0);
const gazeTarget=new T.Vector3(),photoTarget=new T.Vector3();
let speechSource=null;
let interestUntil=0,slowSeconds=0,autoLow=false,lowLighting=false;
let nearestLight=-1;
const diagnostic=new URLSearchParams(location.search).has("metrics");let nextSample=0;
const measurements={avatars:[],calls:0,triangles:0};
function applyQuality(q){
 const low=q==='low',high=q==='high'&&renderer.capabilities.maxTextureSize>=8192;
 renderer.setPixelRatio(Math.min(devicePixelRatio,low?.8:high?2:1.5));
 lowLighting=low;nearestLight=-1;for(const lamp of ceilingLights)lamp.visible=!low;
 renderer.shadowMap.enabled=!low;
 const size=high?2048:1024;
 if(sun.shadow.mapSize.x!==size){sun.shadow.mapSize.set(size,size);sun.shadow.map?.dispose();sun.shadow.map=null}
 resize();
}
const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
function report(){onAvatarStatus?.({ready:readyCount,total:2,failed})}
function cleanupModel(model){model.traverse(o=>{o.geometry?.dispose();if(o.material)for(const mat of [].concat(o.material)){mat.map?.dispose();mat.normalMap?.dispose();mat.dispose()}})}
async function loadCharacter(a,i){
 if(a.loading||a.model)return;
 a.loading=true;
 let model;
 try{
   const start=performance.now();
   const response=await fetch(modelUrls[i][0],{signal:AbortSignal.timeout(45000)});
   if(!response.ok)throw Error('Avatar HTTP '+response.status);
   const buffer=await response.arrayBuffer();
   if(disposed)return;
   const parseStart=performance.now();
   const g=await loader.parseAsync(buffer,'');
   model=g.scene;
   measurements.avatars[i]={parseMs:performance.now()-parseStart,loadMs:performance.now()-start};
   if(disposed){cleanupModel(model);return}
   model.updateMatrixWorld(true);
   const bounds=new T.Box3().setFromObject(model),height=bounds.max.y-bounds.min.y;
   if(!Number.isFinite(height)||height<.1)throw Error('Invalid character bounds');
   const scale=(i===0?1.79:1.70)/height;
   model.scale.setScalar(scale);model.position.y=-bounds.min.y*scale;
   a.rig=rig(model);a.morphs=[];
   model.traverse(o=>{
     if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.isSkinnedMesh)o.frustumCulled=false}
     if(o.morphTargetDictionary&&o.morphTargetInfluences)a.morphs.push(o);
   });
   a.face=createFace(a,i);a.mixer=new T.AnimationMixer(model);a.clips={};
   for(const clip of g.animations)a.clips[clip.name.toLowerCase()]=a.mixer.clipAction(clip);
   a.current=a.clips.idle||Object.values(a.clips)[0];a.current?.play();
   a.mixer.update(.001);capturePose(a);a.root.add(model);a.model=model;
   if(i===0)tint();readyCount++;
 }catch(error){
   if(disposed)return;
   if(model){model.removeFromParent();cleanupModel(model)}
   a.model=null;a.mixer=null;a.failure=true;
   console.error('Avatar load failed',i,error.message);
 }finally{
   a.loading=false;
   if(!disposed){failed=avatars.filter(person=>person.failure).length;report()}
 }
}
function loadCharacters(){
 for(const [i,a] of avatars.entries())if(!a.loading&&!a.model){a.failure=false;loadCharacter(a,i)}
 failed=avatars.filter(a=>a.failure).length;report();
}
loadCharacters();
const down=e=>{if(['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target?.tagName))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){e.preventDefault();keys.add(k)}};const up=e=>keys.delete(e.key.toLowerCase());const blur=()=>keys.clear();
const pd=e=>{drag={x:e.clientX,y:e.clientY,last:e.clientX,moved:false};renderer.domElement.setPointerCapture?.(e.pointerId)};const pm=e=>{if(!drag)return;if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y)>8)drag.moved=true;if(drag.moved){yaw-=(e.clientX-drag.last)*.006;drag.last=e.clientX}};const pu=e=>{if(drag&&!drag.moved){const r=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,camera);const hit=ray.intersectObjects(targets)[0];if(hit){hit.object.getWorldPosition(photoTarget);interestUntil=clock.elapsedTime+5;onSelect?.(hit.object.userData.index)}}drag=null};
if(!preview){window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',blur);renderer.domElement.addEventListener('pointerdown',pd);renderer.domElement.addEventListener('pointermove',pm);renderer.domElement.addEventListener('pointerup',pu);renderer.domElement.addEventListener('pointercancel',()=>{drag=null})}
const resize=()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};const observer=new ResizeObserver(resize);observer.observe(el);resize();
function tick(){if(disposed)return;const realDt=clock.getDelta();if(quality==='auto'&&!autoLow&&readyCount===2){slowSeconds=realDt>.04?slowSeconds+Math.min(realDt,.5):Math.max(0,slowSeconds-realDt);if(slowSeconds>1.8){autoLow=true;applyQuality('low')}}const dt=Math.min(realDt,.05),t=clock.elapsedTime;const p=player.root.position;let dx=0,dz=0;if(keys.has('w')||keys.has('arrowup'))dz--;if(keys.has('s')||keys.has('arrowdown'))dz++;if(keys.has('a')||keys.has('arrowleft'))dx--;if(keys.has('d')||keys.has('arrowright'))dx++;intent.set(dx,0,dz).normalize().applyAxisAngle(upAxis,yaw);velocity.lerp(intent,1-Math.exp(-8*dt));if(action==='hug'){velocity.set(0,0,0);keys.clear()}const moving=velocity.lengthSq()>.001;if(moving&&!preview){const v=velocity;let nx=T.MathUtils.clamp(p.x+v.x*dt*1.3,-5.95,5.95),nz=T.MathUtils.clamp(p.z+v.z*dt*1.3,-70.8,18.8);for(const z of partitions){if(Math.abs(nz-z)<.65&&Math.abs(nx)>1.35){if(p.z>=z+.65)nz=z+.65;else if(p.z<=z-.65)nz=z-.65;else nx=p.x}}p.set(nx,0,nz);turn(player.root,Math.atan2(v.x,v.z),dt)}const q=partner.root.position;
if(action&&t>=until){action='';hugPlan=null}
const duration=until-actionStart,elapsed=t-actionStart,pose=action==='hug'?hugPose(elapsed):null,weight=pose?pose.contact:action?gestureWeight(elapsed,duration):0;
const facing=new T.Vector3(Math.sin(player.root.rotation.y),0,Math.cos(player.root.rotation.y)),side=new T.Vector3(Math.cos(player.root.rotation.y),0,-Math.sin(player.root.rotation.y));
const target=p.clone().addScaledVector(side,action==='hold'?.70:1.05).addScaledVector(facing,-.25);
if(action==='hug'&&hugPlan){const {approach:e,gap}=pose;const left=hugPlan.center.clone().addScaledVector(hugPlan.dir,-gap/2);const right=hugPlan.center.clone().addScaledVector(hugPlan.dir,gap/2);p.lerpVectors(hugPlan.p,left,e);target.lerpVectors(hugPlan.q,right,e);turn(player.root,Math.atan2(hugPlan.dir.x,hugPlan.dir.z),dt);turn(partner.root,Math.atan2(-hugPlan.dir.x,-hugPlan.dir.z),dt)}
target.x=T.MathUtils.clamp(target.x,-5.8,5.8);target.z=T.MathUtils.clamp(target.z,-70.6,18.6);if(partitions.some(z=>Math.abs(p.z-z)<1.5))target.x=T.MathUtils.clamp(target.x,-1.15,1.15);
const delta=target.clone().sub(q);delta.y=0;const follow=!preview&&delta.length()>(action==='hug'?.055:.13);
if(follow){const next=action==='hug'?target.clone():q.clone().addScaledVector(delta,Math.min(dt*3,1));for(const z of partitions){if(Math.abs(next.z-z)<.65&&Math.abs(next.x)>1.35){next.x=T.MathUtils.clamp(next.x,-1.25,1.25);next.z=q.z}}q.copy(next);if(action!=='hug')turn(partner.root,action==='hold'?player.root.rotation.y:Math.atan2(delta.x,delta.z),dt)}
else if(action==='hold')turn(partner.root,player.root.rotation.y,dt);
avatars.forEach((a,i)=>{if(!a.mixer)return;restorePose(a);const walk=action==='hug'?elapsed<.75||elapsed>duration-.75:i?follow:moving;const next=a.clips[action==='wave'?'wave':walk?'walk':'idle']||a.clips.idle||a.current;if(next&&next!==a.current){a.current?.fadeOut(.25);next.reset().fadeIn(.25).play();a.current=next}a.mixer.update(dt);capturePose(a);a.root.updateMatrixWorld(true);const other=avatars[1-i];
gazeTarget.copy(other.root.position);gazeTarget.y+=1.57;
const beat=Math.floor(t/3.2+i)%5;
if(interestUntil>t)gazeTarget.copy(photoTarget);
else if(!action&&beat===2)gazeTarget.copy(camera.position);
else if(!action&&beat===3)frames[i*3].getWorldPosition(gazeTarget);
const expression=action==='hug'?'affectionate':action==='wave'?'happy':action==='hold'?'warm':interestUntil>t?'thoughtful':beat===2?'surprised':moving?'neutral':'warm';
a.face(t,dt,gazeTarget,i&&speechSource?'speaking':expression,i?speechSource:null)});
if(readyCount===2&&weight>0){if(action==='hug'&&p.distanceTo(q)<.72){embrace(player,partner,weight);embrace(partner,player,weight)}else if(action==='hold'){if(p.distanceTo(q)>1.55)action='';else holdHands(player,partner,weight)}}
const inside=p.z<-10&&p.z>-20;const currentZone=p.z>10?ROOMS[0].name:p.z>-10?ROOMS[1].name:p.z>-20?ROOMS[2].name:p.z>-33?ROOMS[3].name:p.z>-46?ROOMS[4].name:p.z>-59?ROOMS[5].name:ROOMS[6].name;if(inside!==room||zone!==currentZone){room=inside;zone=currentZone;onRoom?.(inside,currentZone)}if(lowLighting){
 const nearest=ceilingLights.reduce((best,light,i)=>Math.abs(light.position.z-p.z)<Math.abs(ceilingLights[best].position.z-p.z)?i:best,0);
 if(nearest!==nearestLight){ceilingLights.forEach((light,i)=>{light.visible=i===nearest});nearestLight=nearest}
}
sun.position.set(3,8,p.z+4);sun.target.position.set(0,0,p.z);sun.target.updateMatrixWorld();const off=new T.Vector3(0,2.05,3.3).applyAxisAngle(new T.Vector3(0,1,0),yaw);const desired=new T.Vector3(p.x,0,p.z).add(off);if(action==='hug'&&!motion.matches){const mid=p.clone().lerp(q,.5),sideView=new T.Vector3(Math.cos(player.root.rotation.y),0,-Math.sin(player.root.rotation.y));desired.lerp(mid.addScaledVector(sideView,2.15).add(new T.Vector3(0,1.58,0)),weight*.94)}desired.x=T.MathUtils.clamp(desired.x,-6.4,6.4);desired.z=T.MathUtils.clamp(desired.z,-71.3,19.3);for(const z of partitions){if((p.z-z)*(desired.z-z)<0&&Math.abs(desired.x)>1.5)desired.z=z+(p.z>z?.7:-.7)}if(preview){camera.position.set(Math.sin(t*.17)*.45,2.5,8.5);camera.lookAt(0,1.35,-4)}else{camera.position.lerp(desired,Math.min(dt*8,1));const look=new T.Vector3(0,1.65,-2.2).applyAxisAngle(new T.Vector3(0,1,0),yaw).add(p);if(action==='hug'&&!motion.matches)look.lerp(p.clone().lerp(q,.5).add(new T.Vector3(0,1.15,0)),weight);camera.lookAt(look)}renderer.render(scene,camera);measurements.calls=renderer.info.render.calls;measurements.triangles=renderer.info.render.triangles;if(diagnostic&&t>=nextSample){nextSample=t+.25;renderer.domElement.dataset.metrics=JSON.stringify({...measurements,z:p.z,ready:readyCount})}raf=requestAnimationFrame(tick)}
camera.position.set(0,3.1,9);tick();onReady?.();
return {speech:s=>{speechSource=s},key:(k,v)=>v?keys.add(k):keys.delete(k),act:a=>{if(readyCount!==2)return false;if(a==='hug'&&(player.root.position.distanceTo(partner.root.position)>2.6||partitions.some(z=>(player.root.position.z-z)*(partner.root.position.z-z)<=0)))return false;if((a==='hug'||a==='hold')&&partitions.some(z=>Math.abs(player.root.position.z-z)<1.1))return false;action=a;actionStart=clock.elapsedTime;until=actionStart+(a==='hug'?hugDuration:a==='hold'?8:3.6);if(a==='hug'){keys.clear();const p=player.root.position.clone(),q=partner.root.position.clone(),dir=q.clone().sub(p);dir.y=0;if(dir.lengthSq()<.01)dir.set(1,0,0);dir.normalize();const center=p.clone().lerp(q,.5);center.x=T.MathUtils.clamp(center.x,-5.3,5.3);center.z=T.MathUtils.clamp(center.z,-70.1,18.1);hugPlan={p,q,dir,center};}return true},retryAvatars:()=>{if(failed)loadCharacters()},teleport:inside=>{const z=typeof inside==='number'?ROOMS[inside]?.z??4:inside?-14:4;keys.clear();velocity.set(0,0,0);action='';hugPlan=null;player.root.position.set(-.55,0,z);partner.root.position.set(.65,0,z-.9);yaw=0;camera.position.set(0,3,z+4)},metrics:()=>({...measurements,position:player.root.position.toArray(),quality:autoLow?'low':quality}),quality:q=>{quality=q;autoLow=false;slowSeconds=0;applyQuality(q)},color:c=>{outfit=c;tint()},photos:items=>{frames.forEach((f,i)=>{const idx=i%6;const src=items[idx]?.type==='image'?items[idx].src:null;if((f.userData.src??null)===src)return;f.userData.src=src;if(!src){f.material.map?.dispose();f.material.map=picture(idx);f.material.needsUpdate=true;return}new T.TextureLoader().load(src,tex=>{if(disposed||f.userData.src!==src){tex.dispose();return}tex.colorSpace=T.SRGBColorSpace;f.material.map?.dispose();f.material.map=tex;f.material.needsUpdate=true},undefined,()=>{})})},dispose:()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur);scene.traverse(o=>{if(o.isInstancedMesh)o.dispose();o.geometry?.dispose();if(o.material){for(const mat of [].concat(o.material)){mat.map?.dispose();mat.dispose()}}});envTarget.dispose();renderer.dispose();renderer.domElement.remove()}}
}
