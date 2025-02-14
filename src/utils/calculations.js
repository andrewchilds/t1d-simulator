import { roundToBasalPrecision } from './numbers.js';
import { DAMPENING_THRESHOLD, VERY_LOW_RANGE, ABSOLUTE_MIN_BG } from './constants.js';

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

// We simulate a natural mechanism that dampens blood sugar dropping below 30-40, such that it would
// take exponentially more insulin to drop from 30 to 20 compared to 100 to 90.
//
// Ref: https://allnurses.com/lowest-blood-sugar-seen-t145465/
// Ref: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2699723/
// "In univariate analysis of a subset of 338 admissions for which any hypoglycemia was documented,
// the mean lowest recorded blood glucose was 31.8 mg/dl for patients who died in the hospital vs.
// 40 mg/dl for those who did not (P = 0.028)."
export function slowDownIAlreadyfHypo(bgEffect, currentBg) {
  if (bgEffect >= 0 || currentBg >= DAMPENING_THRESHOLD) {
    return bgEffect;
  }

  // Stop the effect entirely if we're already below 25.
  if (currentBg <= ABSOLUTE_MIN_BG && bgEffect < 0) {
    return 0;
  }

  // Calculate dampening factor (0 to 1)
  const range = DAMPENING_THRESHOLD - ABSOLUTE_MIN_BG;
  const factor = Math.pow((currentBg - ABSOLUTE_MIN_BG) / range, 2);

  return bgEffect * Math.max(0.01, factor);
}
