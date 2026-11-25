// Azure 55-channel order, restricted to speech-owned jaw and lip shapes.
// Smile, cheek, blink and eye direction remain owned by the expression layer.
export const speechChannels = {
 jawForward:14,jawLeft:15,jawRight:16,jawOpen:17,mouthClose:18,mouthFunnel:19,
 mouthPucker:20,mouthLeft:21,mouthRight:22,mouthStretchLeft:29,mouthStretchRight:30,
 mouthRollLower:31,mouthRollUpper:32,mouthShrugLower:33,mouthShrugUpper:34,
 mouthPressLeft:35,mouthPressRight:36,mouthLowerDownLeft:37,mouthLowerDownRight:38,
 mouthUpperUpLeft:39,mouthUpperUpRight:40,tongueOut:51
};
export function speechFrame(source){
 if(!source||source.audio.paused||source.audio.ended||source.audio.readyState<2)return null;
 if(source.frames)return source.frames[Math.floor(source.audio.currentTime*60)]??null;
 source.analyser.getByteTimeDomainData(source.samples);
 let power=0;
 for(const sample of source.samples)power+=((sample-128)/128)**2;
 source.envelope[17]=Math.min(.38,Math.max(0,Math.sqrt(power/source.samples.length)-.018)*2);
 return source.envelope;
}
