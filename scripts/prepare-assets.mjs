// Cache pinned bytes for same-origin browser loads. A clean build fails closed if the upstream is unavailable.
import {mkdir,readFile,writeFile,rename,rm} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
const base='public/assets/avatars';
const upstream='https://raw.githubusercontent.com/memoriesrohit/avatar-studio/2fd9ec82fbe1613d40ae38aadcca3f410725f740/models/';
const files=[
 ['arjun-v4','arjun_smart',10984616,'1112221255e1da4da05b5200f314694c98e37988f00937048a5cea1327debd32'],
 ['priya-v4','priya_casual',13471776,'c56dc61a98d803e9cd30885f77fc05a2285494c0634642084d00b232e99fdb51']
];
await mkdir(base,{recursive:true});
for(const [local,remote,size,sha] of files){
 const path=base+'/'+local+'.glb';
 const valid=data=>data.length===size&&data.toString('ascii',0,4)==='glTF'&&data.readUInt32LE(8)===size&&createHash('sha256').update(data).digest('hex')===sha;
 let cached;
 try{cached=await readFile(path)}catch(e){if(e.code!=='ENOENT')throw e}
 if(cached&&valid(cached))continue;
 const response=await fetch(upstream+remote+'.glb',{signal:AbortSignal.timeout(45000)});
 if(!response.ok)throw Error('Avatar download failed for '+local+' (HTTP '+response.status+')');
 const chunks=[];let received=0;
 for await(const chunk of response.body){
   received+=chunk.length;if(received>size)throw Error('Oversized avatar '+local);
   chunks.push(chunk);
 }
 const bytes=Buffer.concat(chunks,received);
 if(!valid(bytes))throw Error('Avatar integrity check failed for '+local);
 const tmp=path+'.'+randomUUID()+'.tmp';
 try{await writeFile(tmp,bytes);await rename(tmp,path)}finally{await rm(tmp,{force:true})}
}
