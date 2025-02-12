// Ref: https://en.wikipedia.org/wiki/Dietary_Reference_Intake
const CALORIE_TO_NUTRIENT_RATIOS = {
  fat: 9,
  saturated_fat: 9,
  protein: 4,
  carbs: 4,
  sugars: 4
};

function isPrimaryMacro(name) {
  return name === 'fat' || name === 'carbs' || name === 'protein';
}

export function calculateCalorieDistribution(nutrition) {
  const dist = { sum: 0 };
  Object.entries(CALORIE_TO_NUTRIENT_RATIOS).forEach(([nutrientName, ratio]) => {
    const cals = nutrition[nutrientName] * ratio;
    if (isPrimaryMacro(nutrientName)) {
      dist.sum += cals;
    }
    dist[nutrientName] = cals;
  });

  return dist;
}
