import {useEffect,useRef} from 'react';
export function MuseumDialog({children,onClose}){
 const ref=useRef(null);
 useEffect(()=>{
   const dialog=ref.current,trigger=document.activeElement;
   dialog.showModal();
   return ()=>{dialog.close();if(trigger?.isConnected)trigger.focus()};
 },[]);
 return <dialog ref={ref} className="modal" aria-labelledby="museum-dialog-title"
   onCancel={e=>{e.preventDefault();onClose()}}
   onClick={e=>{if(e.target!==ref.current)return;const r=ref.current.getBoundingClientRect();
    if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose()}}>
   {children}
 </dialog>;
}
