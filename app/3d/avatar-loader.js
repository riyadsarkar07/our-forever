import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
const spareClothes=new Set(['Outfit_formal','Skin_formal','Top_shirt','Skin_shirt','Top_tee','Skin_tee','Trousers','Shoes']);
export function avatarLoader(){
 const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
 // Keep the skeleton and animation node indices. Skip unused garment dependencies before image decoding.
 loader.register(parser=>({name:'OriginalOutfit',beforeRoot(){
   for(const node of parser.json.nodes){
     if(spareClothes.has(node.name)){delete node.mesh;delete node.skin}
   }
 }}));
 return loader;
}
