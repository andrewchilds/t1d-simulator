import { shuffleExisting } from './array.js';
import { ABSORPTION_RATES } from './constants.js';

const MEALS = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  SNACK: 'snack',
  DINNER: 'dinner',
  DESSERT: 'dessert',
};

const FOODS = [

  // BREAKFAST

  {
    id: 100,
    name: 'Cereal, Milk, and Strawberries',
    emoji: '🥣',
    color: '#ffc6c5',
    calories: 253,
    fat: 3,
    carbs: 50,
    sugars: 24,
    protein: 10,
    meals: [MEALS.BREAKFAST],
    absorption: [
      { carbs: 20, delay: 0, duration: ABSORPTION_RATES.CARBS.VERY_FAST.duration },
      { carbs: 40, delay: 0, duration: ABSORPTION_RATES.CARBS.FAST.duration }
    ]
  },
  {
    id: 101,
    name: 'Spinach and Cheese Omelette, Side of Potatoes',
    emoji: '🥬',
    color: '#c3e49a',
    calories: 281,
    fat: 14,
    carbs: 20,
    sugars: 0,
    protein: 15,
    meals: [MEALS.BREAKFAST],
    absorption: [
      { carbs: 10, delay: 0, duration: ABSORPTION_RATES.CARBS.FAST.duration },
      { carbs: 10, delay: 0, duration: ABSORPTION_RATES.CARBS.MEDIUM.duration }
    ]
  },
  {
    id: 102,
    name: 'Greek Yogurt, Granola, and Blueberries',
    emoji: '🥣',
    color: '#ade1ff',
    calories: 390,
    fat: 12,
    carbs: 55,
    sugars: 24,
    protein: 22,
    meals: [MEALS.BREAKFAST],
    absorption: [
      { carbs: 25, delay: 0, duration: ABSORPTION_RATES.CARBS.FAST.duration },
      { carbs: 30, delay: 0, duration: ABSORPTION_RATES.CARBS.MEDIUM.duration }
    ]
  },
  {
    id: 103,
    name: 'Eggs, Bacon, Potatoes, and Avocado',
    emoji: '🍳',
    color: '#b43b24',
    calories: 415,
    fat: 25,
    carbs: 28,
    sugars: 0,
    protein: 20,
    meals: [MEALS.BREAKFAST],
    absorption: [
      { carbs: 5, delay: 0, duration: ABSORPTION_RATES.CARBS.FAST.duration },
      { carbs: 15, delay: 0, duration: ABSORPTION_RATES.CARBS.MEDIUM.duration },
      { carbs: 10, delay: 0, duration: ABSORPTION_RATES.CARBS.VERY_SLOW.duration }
    ]
  },
  {
    id: 104,
    name: 'Pancakes, Maple Syrup, and Butter',
    emoji: '🥞',
    color: '#e39210',
    calories: 473,
    fat: 20,
    carbs: 70,
    sugars: 50,
    protein: 6,
    meals: [MEALS.BREAKFAST],
    absorption: [
      { carbs: 20, delay: 0, duration: ABSORPTION_RATES.CARBS.VERY_FAST.duration },
      { carbs: 40, delay: 0, duration: ABSORPTION_RATES.CARBS.MEDIUM.duration },
      { carbs: 12, delay: 0, duration: ABSORPTION_RATES.CARBS.SLOW.duration }
    ]
  },
  {
    id: 105,
    name: 'Bacon, Egg, and Cheese on a Bagel',
    emoji: '🥯',
    color: '#f6d2af',
    calories: 500,
    fat: 22,
    carbs: 47,
    sugars: 4,
    protein: 26,
    meals: [MEALS.BREAKFAST],
    absorption: [
      { carbs: 20, delay: 0, duration: ABSORPTION_RATES.CARBS.FAST.duration },
      { carbs: 20, delay: 0, duration: ABSORPTION_RATES.CARBS.MEDIUM.duration },
      { carbs: 10, delay: 0, duration: ABSORPTION_RATES.CARBS.VERY_SLOW.duration }
    ]
  },

  // LUNCH

  {
    id: 200,
    name: 'Apple, Cheese, Salami and Crackers',
    emoji: '🍎',
    color: '#ffe4c2',
    calories: 0,
    fat: 7,
    carbs: 25,
    sugars: 19,
    protein: 7,
    meals: [MEALS.LUNCH],
    absorption: [
      { carbs: 10, delay: 0, duration: ABSORPTION_RATES.CARBS.FAST.duration },
      { carbs: 15, delay: 0, duration: ABSORPTION_RATES.CARBS.MEDIUM.duration }
    ]
  },
  {
    id: 201,
    name: 'Sunflower Seed Butter & Jelly Sandwich',
    emoji: '🥪',
    color: '#ac0048',
    calories: 320,
    fat: 12,
    carbs: 42,
    sugars: 12,
    protein: 10,
    meals: [MEALS.LUNCH],
    absorption: [
      { carbs: 15, delay: 0, duration: ABSORPTION_RATES.CARBS.FAST.duration },
      { carbs: 20, delay: 0, duration: ABSORPTION_RATES.CARBS.SLOW.duration }
    ]
  },
  {
    id: 202,
    name: 'Shrimp Tacos',
    emoji: '🌮',
    color: '#ffbbbb',
    calories: 250,
    fat: 8,
    carbs: 23,
    sugars: 2,
    protein: 22,
    meals: [MEALS.LUNCH],
    absorption: [
      { carbs: 13, delay: 0, duration: ABSORPTION_RATES.CARBS.MEDIUM.duration },
      { carbs: 10, delay: 0, duration: ABSORPTION_RATES.CARBS.SLOW.duration }
    ]
  },
  {
    id: 203,
    name: 'Carnitas Burrito',
    emoji: '🌯',
    color: '#965c00',
    calories: 965,
    fat: 38,
    carbs: 100,
    sugars: 3,
    protein: 50,
    meals: [MEALS.LUNCH],
    absorption: [
      { carbs: 50, delay: 0, duration: ABSORPTION_RATES.CARBS.FAST.duration },
      { carbs: 50, delay: 0, duration: ABSORPTION_RATES.CARBS.SLOW.duration }
    ]
  },
  {
    id: 204,
    name: 'Salmon Bento Box',
    emoji: '🍱',
    color: '#f06539',
    calories: 383,
    fat: 19,
    carbs: 21,
    sugars: 3,
    protein: 32,
    meals: [MEALS.LUNCH],
    absorption: [
      { carbs: 20, delay: 0, duration: ABSORPTION_RATES.CARBS.FAST.duration },
      { carbs: 10, delay: 0, duration: ABSORPTION_RATES.CARBS.SLOW.duration }
    ]
  },

  // DINNER

  {
    id: 300,
    name: '2 slices of Cheese Pizza',
    emoji: '🍕',
    color: '#ffdd50',
    calories: 333,
    fat: 12,
    carbs: 43,
    sugars: 9,
    protein: 12,
    meals: [MEALS.DINNER],
    absorption: [
      { carbs: 15, delay: 0, duration: ABSORPTION_RATES.CARBS.FAST.duration },
      { carbs: 10, delay: 0, duration: ABSORPTION_RATES.CARBS.MEDIUM.duration },
      { carbs: 30, delay: ABSORPTION_RATES.CARBS.FAST.duration, duration: ABSORPTION_RATES.CARBS.SLOW.duration }
    ]
  },
  {
    id: 301,
    name: 'Cheeseburger and French Fries',
    emoji: '🍔',
    color: '#7e451e',
    calories: 900,
    fat: 46,
    carbs: 88,
    sugars: 8,
    fiber: 6,
    protein: 34,
    meals: [MEALS.DINNER],
    absorption: [
      { carbs: 30, delay: 0, duration: ABSORPTION_RATES.CARBS.FAST.duration },
      { carbs: 30, delay: 0, duration: ABSORPTION_RATES.CARBS.MEDIUM.duration },
      { carbs: 30, delay: 0, duration: ABSORPTION_RATES.CARBS.VERY_SLOW.duration }
    ]
  },
  {
    id: 302,
    name: 'Curry Chicken and White Rice',
    emoji: '🍛',
    color: '#b44913',
    calories: 425,
    fat: 11,
    carbs: 52,
    sugars: 10,
    fiber: 4,
    protein: 32,
    meals: [MEALS.DINNER],
    absorption: [
      { carbs: 20, delay: 0, duration: ABSORPTION_RATES.CARBS.FAST.duration },
      { carbs: 15, delay: 0, duration: ABSORPTION_RATES.CARBS.MEDIUM.duration },
      { carbs: 20, delay: 0, duration: ABSORPTION_RATES.CARBS.SLOW.duration }
    ]
  },
  {
    id: 303,
    name: 'Spaghetti and Meatballs',
    emoji: '🍝',
    color: '#970000',
    calories: 390,
    fat: 12,
    carbs: 50,
    sugars: 5,
    protein: 20,
    meals: [MEALS.DINNER],
    absorption: [
      { carbs: 25, delay: 0, duration: ABSORPTION_RATES.CARBS.FAST.duration },
      { carbs: 15, delay: 0, duration: ABSORPTION_RATES.CARBS.MEDIUM.duration },
      { carbs: 10, delay: 0, duration: ABSORPTION_RATES.CARBS.VERY_SLOW.duration }
    ]
  },
  {
    id: 304,
    name: 'Steak Salad',
    emoji: '🥗',
    color: '#4b7a05',
    calories: 425,
    fat: 20,
    carbs: 20,
    sugars: 2,
    fiber: 4,
    protein: 34,
    meals: [MEALS.DINNER],
    absorption: [
      { carbs: 10, delay: 0, duration: ABSORPTION_RATES.CARBS.MEDIUM.duration },
      { carbs: 10, delay: 0, duration: ABSORPTION_RATES.CARBS.VERY_SLOW.duration }
    ]
  },
];

function getRandomFoods(type, count = 4) {
  let filtered = FOODS.filter(f => {
    return f.meals.includes(type);
  });

  shuffleExisting(filtered);

  return filtered.slice(0, count);
}

export function getRandomBreakfastFoods(count = 3) {
  return getRandomFoods(MEALS.BREAKFAST, count);
}

export function getRandomLunchFoods(count = 3) {
  return getRandomFoods(MEALS.LUNCH, count);
}

export function getRandomDinnerFoods(count = 3) {
  return getRandomFoods(MEALS.DINNER, count);
}
