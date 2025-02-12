export const MAX_V = 400;
export const VERY_HIGH_RANGE = 250;
export const UPPER_RANGE = 180;
export const LOWER_RANGE = 70;
export const VERY_LOW_RANGE = 55;
export const MIN_V = 40;

export const ABSORPTION_RATES = {
  INSULIN: {
    RAPID: { peak: 13, duration: 48 }, // 1h 5m peak, 4h duration
  },
  CARBS: {
    VERY_FAST: { delay: 0, duration: 12 }, // 1h
    FAST: { delay: 0, duration: 21 }, // 1h 45m
    MEDIUM: { delay: 0, duration: 30 }, // 2h 30m
    SLOW: { delay: 0, duration: 39 }, // 3h 15m
    VERY_SLOW: { delay: 0, duration: 48 }, // 4h
  },
  PROTEIN: { delay: 36, duration: 48 } // 3h delay + 4h duration
};
