import { roundToBasalPrecision } from './numbers.js';

// Exponential insulin curve, parameterized by peak and duration,
// due to Dragan Maksimovic (@dm61).
// Worked by Pete (@ps2) in the notebook
//   https://github.com/ps2/LoopIOB/blob/master/ScalableExp.ipynb
// Reworked by Marius Eriksen to be vectorized by numpy.
export function exponentialInsulinCurve(t, peak, duration) {
  let tau = peak * (1 - peak / duration) / (1 - 2 * peak / duration);
  let a = 2 * (tau / duration);
  let S = 1 / (1 - a + (1 + a) * Math.exp(-duration / tau));

  return Math.max(0, (S / Math.pow(tau, 2)) * t * (1 - t / duration) * Math.exp(-t / tau));
}

// Creates a saw-tooth curve distribution
export function walshCarbAbsorptionCurve(t, duration) {
  let a = t / duration;
  let q = 4 / duration;

  if (t <= duration / 2) {
    return q * a;
  } else {
    return q * (1 - a);
  }
}

export function sineAbsorptionCurve(t, duration) {
  let a = Math.sin((t * Math.PI) / duration);
  let q = (Math.PI / 2) / duration;

  return q * a;
}

export function calcPureCorrection(currentBg, targetBg, correctionFactor) {
  return Math.max(0, roundToBasalPrecision((currentBg - targetBg) / correctionFactor));
}

export function calcCorrection(currentBg, targetBg, correctionFactor, insulinOnBoard) {
  let c = calcPureCorrection(currentBg, targetBg, correctionFactor);
  return Math.max(0, roundToBasalPrecision(c - insulinOnBoard));
}
