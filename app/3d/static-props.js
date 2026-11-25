import {BoxGeometry,SphereGeometry,InstancedMesh,Matrix4,Vector3} from 'three';

// Keep interactive frames as individual raycast targets. Batch repeated architectural
// shapes per section so distant rooms can still be culled independently.
export function batchStaticProps(scene){
 const groups=new Map(),scale=new Vector3(),matrix=new Matrix4();
 for(const mesh of scene.children){
   if(!mesh.isMesh||mesh.children.length||!['BoxGeometry','SphereGeometry'].includes(mesh.geometry.type))continue;
   const p=mesh.geometry.parameters,box=mesh.geometry.type==='BoxGeometry';
   const shape=box?'box':'sphere-'+p.widthSegments+'-'+p.heightSegments;
   const key=[shape,mesh.material.uuid,mesh.castShadow,mesh.receiveShadow,Math.floor(mesh.position.z/12)].join('/');
   if(!groups.has(key))groups.set(key,[]);
   groups.get(key).push(mesh);
 }
 for(const group of groups.values()){
   if(group.length<3)continue;
   const first=group[0],box=first.geometry.type==='BoxGeometry',p=first.geometry.parameters;
   const geometry=box?new BoxGeometry(1,1,1):new SphereGeometry(1,p.widthSegments,p.heightSegments);
   const batch=new InstancedMesh(geometry,first.material,group.length);
   batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;
   group.forEach((mesh,index)=>{
     const p=mesh.geometry.parameters;
     if(box)scale.set(p.width,p.height,p.depth);else scale.setScalar(p.radius);
     scale.multiply(mesh.scale);matrix.compose(mesh.position,mesh.quaternion,scale);
     batch.setMatrixAt(index,matrix);mesh.removeFromParent();mesh.geometry.dispose();
   });
   batch.computeBoundingSphere();scene.add(batch);
 }
}
