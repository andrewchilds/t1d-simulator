
// scaleLinear(5, [0, 10], [0, 300]) === 150
export function scaleLinear(d, [inMin, inMax], [outMin, outMax]) {
  const scaledIn = (d - inMin) / (inMax - inMin);
  const scaledOut = (scaledIn * (outMax - outMin)) + outMin;

  return scaledOut;
}
