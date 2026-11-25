import {readFile} from 'node:fs/promises';
for(const name of ['arjun','priya']){
 const data=await readFile('public/assets/avatars/'+name+'-v4.glb');
 const length=data.readUInt32LE(12),g=JSON.parse(data.subarray(20,20+length)),base=28+length;
 const textures=g.images.map(image=>{
  const view=g.bufferViews[image.bufferView],webp=data.subarray(base+(view.byteOffset||0));
  const kind=webp.toString('ascii',12,16);
  let width,height;
  if(kind==='VP8X'){width=1+webp.readUIntLE(24,3);height=1+webp.readUIntLE(27,3)}
  if(kind==='VP8 '){width=webp.readUInt16LE(26)&16383;height=webp.readUInt16LE(28)&16383}
  if(kind==='VP8L'){const bits=webp.readUInt32LE(21);width=(bits&16383)+1;height=((bits>>>14)&16383)+1}
  if(!width||!height)throw Error('Unexpected image format for '+image.name);
  return {name:image.name,width,height};
 });
 console.log(JSON.stringify({name,bytes:data.length,clips:g.animations.map(a=>a.name),
  joints:g.skins[0].joints.map(i=>g.nodes[i].name),
  morphs:[...new Set(g.meshes.flatMap(m=>m.extras?.targetNames??[]))],
  materials:g.materials.map(m=>m.name),textures,
  rgbaMipEstimateMiB:textures.reduce((total,im)=>total+im.width*im.height*4*4/3,0)/1048576,
  allOutfitTriangles:g.meshes.flatMap(m=>m.primitives).reduce((sum,p)=>sum+g.accessors[p.indices].count/3,0)},null,2));
}
