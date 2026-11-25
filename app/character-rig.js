import * as T from 'three';
const Y=new T.Vector3(0,1,0);
const pos=b=>b.getWorldPosition(new T.Vector3());
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
export function rig(model){
  const bones=[];model.traverse(o=>{if(o.isBone)bones.push(o)});
  const hand=side=>bones.find(b=>[side+'hand','hand'+side,'mixamorig'+side+'hand','hand'+(side==='left'?'l':'r'),(side==='left'?'l':'r')+'hand','wrist'+(side==='left'?'l':'r')].includes(norm(b.name)))||bones.find(b=>{const n=norm(b.name);return n.includes('hand')&&!n.match(/thumb|index|middle|ring|pinky|finger/)&&(n.includes(side)||n.endsWith(side==='left'?'l':'r'))});
  const chain=side=>{const h=hand(side);if(!h||!h.parent?.isBone||!h.parent.parent?.isBone)return null;return {hand:h,lower:h.parent,upper:h.parent.parent}};
  const fingers={};
  for(const side of ['left','right']){
    const arm=chain(side);if(!arm)continue;
    const joint=name=>bones.find(b=>norm(b.name).endsWith(side+'hand'+name+'1'));
    const index=joint('index'),pinky=joint('pinky');
    if(!index||!pinky)continue;
    const across=pos(pinky).sub(pos(index)).normalize().multiplyScalar(side==='left'?1:-1);
    fingers[side]=bones.filter(b=>new RegExp(side+'hand(index|middle|ring|pinky)[12]$').test(norm(b.name))).map(bone=>({
      bone,axis:across.clone().applyQuaternion(bone.getWorldQuaternion(new T.Quaternion()).invert())
    }));
  }
  return {left:chain('left'),right:chain('right'),bones,fingers};
}
function curl(a,side,amount){
 for(const {bone,axis} of a.rig.fingers[side]??[])bone.rotateOnAxis(axis,amount)
}
function aim(b,child,target,weight){const a=pos(b),v=pos(child).sub(a),w=target.clone().sub(a);if(v.lengthSq()<1e-8||w.lengthSq()<1e-8)return;const d=new T.Quaternion().setFromUnitVectors(v.normalize(),w.normalize()),world=b.getWorldQuaternion(new T.Quaternion());const desired=d.multiply(world);const parent=b.parent.getWorldQuaternion(new T.Quaternion()).invert();b.quaternion.slerp(parent.multiply(desired),weight);b.updateMatrixWorld(true)}
// Two-bone arm IK with a stable elbow pole. World-space targets are converted into joint-local rotations.
function solve(chain,target,pole,weight){if(!chain||weight<=0)return;const {upper,lower,hand}=chain;const a=pos(upper),b=pos(lower),h=pos(hand),l1=a.distanceTo(b),l2=b.distanceTo(h);if(l1<.02||l2<.02)return;const dir=target.clone().sub(a),raw=dir.length();if(raw<.001)return;dir.normalize();const d=T.MathUtils.clamp(raw,Math.abs(l1-l2)+.005,l1+l2-.008);const along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along));const bend=pole.clone().sub(a);bend.addScaledVector(dir,-bend.dot(dir));if(bend.lengthSq()<.001)bend.copy(Y).cross(dir);bend.normalize();const elbow=a.clone().addScaledVector(dir,along).addScaledVector(bend,height);const end=a.clone().addScaledVector(dir,d);aim(upper,lower,elbow,weight);aim(lower,hand,end,weight)}
export function capturePose(a){if(!a.rig)return;if(!a.pose)a.pose=new Map(a.rig.bones.map(b=>[b,b.quaternion.clone()]));else for(const [bone,q] of a.pose)q.copy(bone.quaternion)}
export function restorePose(a){if(a.pose)for(const [b,q] of a.pose)b.quaternion.copy(q)}
const smooth=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x)};
export function gestureWeight(elapsed,duration){return Math.min(smooth((elapsed-.75)/.7),smooth((duration-elapsed)/.95))}
// A proper embrace uses the partner's far upper back, not their shoulders.
// Heights are based on actual skeleton landmarks rather than a single fixed y.
function findBone(a,pattern){return a.rig?.bones.find(b=>pattern.test(norm(b.name)))}
export function embrace(a,b,weight){
 if(!a.rig||!b.model)return;
 a.root.updateMatrixWorld(true);b.root.updateMatrixWorld(true);
 const neck=findBone(b,/neck$/),spine=findBone(b,/spine2$|upperchest$|chest$/);
 const y=neck?pos(neck).y-b.root.position.y-.18:1.28;
 const chest=spine?pos(spine).y-b.root.position.y:y-.12;
 for(const [side,sign] of [['left',1],['right',-1]]){
   // Facing avatars have opposing local axes; use the opposite side of the partner.
   const target=b.root.localToWorld(new T.Vector3(-sign*.13,side==='left'?y:chest-.08,-.15));
   const pole=a.root.localToWorld(new T.Vector3(sign*.58,side==='left'?y-.20:chest-.22,.16));
   solve(a.rig[side],target,pole,weight);curl(a,side,.12*weight);
 }
 const head=findBone(a,/head$/);
 if(head){const tilt=new T.Quaternion().setFromEuler(new T.Euler(.045,0,.10));head.quaternion.slerp(head.quaternion.clone().multiply(tilt),weight)}
}
export function holdHands(a,b,weight){
 if(!a.rig||!b.rig)return;
 a.root.updateMatrixWorld(true);b.root.updateMatrixWorld(true);
 let best=null,distance=Infinity;
 for(const [left,right] of [['left','right'],['right','left']]){
   const first=a.rig[left],second=b.rig[right];if(!first||!second)continue;
   const span=pos(first.upper).distanceTo(pos(second.upper));
   if(span<distance){best=[left,right];distance=span}
 }
 if(!best)return;
 const near=pos(a.rig[best[0]].upper),far=pos(b.rig[best[1]].upper);
 const mid=near.clone().lerp(far,.5);mid.y-=.48;
 const front=new T.Vector3(0,0,.09).applyAxisAngle(Y,a.root.rotation.y);mid.add(front);
 for(const [person,key] of [[a,best[0]],[b,best[1]]]){
   const sign=key==='left'?1:-1,pole=person.root.localToWorld(new T.Vector3(sign*.32,1.02,-.18));
   solve(person.rig[key],mid,pole,weight);curl(person,key,.18*weight);
 }
}
export function turn(root,angle,dt){let delta=Math.atan2(Math.sin(angle-root.rotation.y),Math.cos(angle-root.rotation.y));root.rotation.y+=delta*Math.min(1,dt*10)}
