// Keep the vertical gait and lateral sway. World-space motion and collisions own
// travel across the floor. The source walk contains over a metre of hip travel.
export function makeWalkInPlace(track,origin){
 const {times,values}=track,last=times.length-1;
 if(last<1||values.length!==times.length*3||times[last]<=times[0])return;
 for(const axis of [0,2]){
   const start=values[axis],travel=values[last*3+axis]-start;
   for(let i=0;i<=last;i++){
     const progress=(times[i]-times[0])/(times[last]-times[0]);
     values[i*3+axis]+=origin[axis]-start-travel*progress;
   }
 }
}
