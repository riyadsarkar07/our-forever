const phases = [
  ['approach', 0.72], ['orient', 1.08], ['anticipation', 1.38],
  ['contact', 1.78], ['embrace', 2.4], ['hold', 4.9],
  ['release', 5.75], ['recover', 6.3]
];
export const hugDuration = phases.at(-1)[1];
export function hugPhase(seconds) {
  return phases.find(([,end]) => seconds < end)?.[0] ?? 'idle';
}
export function smooth(start, end, value) {
  const x = Math.max(0, Math.min(1, (value-start)/(end-start)));
  return x*x*(3-2*x);
}
export function hugPose(t) {
  const contact = smooth(1.08, 2.4, t) * (1-smooth(4.9,5.75,t));
  return {phase: hugPhase(t), contact,
    approach: smooth(0, .82, t),
    gap: .84 - .42*smooth(1.08,1.78,t) + .53*smooth(5.28,6.3,t)};
}
export function blinkController(seed) {
  let next = 1.5 + (seed%11)*.21, state = seed;
  return time => {
    if (time > next+.18) {
      state = (state * 16807) % 2147483647;
      next = time + 2.4 + 3.1 * state / 2147483647;
    }
    return time < next ? 0 : Math.sin(Math.PI*(time-next)/.18);
  };
}
