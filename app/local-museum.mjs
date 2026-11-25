const key='our-forever-v1';
export function availableSlots(items){return Math.max(0,6-items.length)}
export function readMuseum(storage,defaults){
 const raw=storage.getItem(key);
 if(!raw)return defaults;
 const saved=JSON.parse(raw),result={...defaults};
 if(!saved||typeof saved!=='object')throw Error('Invalid saved museum');
 for(const k of ['name','me','partner','letter','theme','color']){
   if(typeof saved[k]==='string')result[k]=saved[k];
 }
 result.memories=(Array.isArray(saved.memories)?saved.memories:[]).filter(
   m=>m?.type==='image'&&typeof m.title==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(m.src)
 ).slice(0,6);
 return result;
}
export function saveMuseum(storage,data){
 storage.setItem(key,JSON.stringify({...data,memories:data.memories.filter(m=>m.type==='image')}));
}
export async function readPhoto(file){
 const url=URL.createObjectURL(file);
 try{
   const image=new Image();image.src=url;await image.decode();
   const scale=Math.min(1,900/Math.max(image.width,image.height));
   const canvas=document.createElement('canvas');
   canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
   const ctx=canvas.getContext('2d');
   ctx.drawImage(image,0,0,canvas.width,canvas.height);
   return canvas.toDataURL(file.type==='image/jpeg'?'image/jpeg':'image/webp',.78);
 }finally{URL.revokeObjectURL(url)}
}
