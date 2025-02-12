<script>
  import './global.css';
  import './simulator.css';

  import { onMount } from 'svelte';

  import { initColorScheme } from './utils/theme.js';

  import { scaleLinear } from './utils/chart.js';
  import { MIN_V, MAX_V, LOWER_RANGE, UPPER_RANGE, VERY_LOW_RANGE, VERY_HIGH_RANGE } from './utils/constants.js';
  import {
    diffInMilliseconds,
    formatDate,
    offsetDateByHours,
    ONE_DAY,
    ONE_MINUTE,
    secondsSoFar,
    setToBeginningOfDay,
    setToBeginningOfHour
  } from './utils/date.js';
  import { createRange, mean, randomValueFrom, stdDev } from './utils/array.js';
  import { exponentialInsulinCurve, sineAbsorptionCurve, walshCarbAbsorptionCurve } from './utils/calculations.js';
  import { oneDecimal, randomInt } from './utils/numbers.js';
  import { pluralize } from './utils/str.js';
  import { getRandomBreakfastFoods, getRandomDinnerFoods, getRandomLunchFoods } from './utils/mockFoods.js';
  import { calculateCalorieDistribution } from './utils/nutrition.js';
  import { ABSORPTION_RATES } from './utils/constants.js';
  import { isLocalhost } from './utils/is.js';

  import Button from './components/Button.svelte';
  import DailyRecap from './components/DailyRecap.svelte';
  import Disclaimer from './components/Disclaimer.svelte';
  import GameOver from './components/GameOver.svelte';
  import GameSettings from './components/GameSettings.svelte';
  import MessageDialog from './components/MessageDialog.svelte';
  import MockCorrectionForm from './components/MockCorrectionForm.svelte';
  import MockMealForm from './components/MockMealForm.svelte';
  import PumpSettings from './components/PumpSettings.svelte';
  import TextField from './components/TextField.svelte';

  import ArrowRight from './icons/ArrowRight.svelte';
  import Menu from './icons/Menu.svelte';
  import SimulatorHelp from './components/SimulatorHelp.svelte';

  const ACTIONS = {
    WATER: 'water',
    JUICE: 'juice',
    SODA: 'soda',
    PEZ: 'pez',
    POPCORN: 'popcorn',
    PIZZA: 'pizza',
    CEREAL: 'cereal',
    INSULIN: 'insulin',
    FINGERSTICK: 'fingerstick',
    KETONES: 'ketones',
    GLUCAGON: 'glucagon',
    PUMP_SETTINGS: 'pump_settings'
  };

  const SPEED_VALUES = [3840, 1920, 960, 480, 240, 120, 60];

  const PUMP_SITES = ['left abdomen', 'right abdomen', 'left arm', 'right arm', 'left leg', 'right leg', 'left lower back', 'right lower back'];

  // Ref: https://medlineplus.gov/ency/article/003585.htm
  // Ref: https://together.stjude.org/en-us/patient-education-resources/tests-procedures/check-urine-for-glucose-and-ketones.html
  const DKA_LEVEL_KETONES = 150; // mg/dL

  const TIPS = {
    WATER: {
      tip: 'Drink plenty of water each day. Staying hydrated helps lower insulin resistance, flushes ketones from your system, helps you recover from illness, and improves your CGM sensor accuracy.',
      sources: [
        {
          title: 'Water and Diabetes',
          url: 'https://www.diabetes.co.uk/food/water-and-diabetes.html'
        }
      ]
    },
    ACTIVITY: {
      tip: 'Make time in your daily routine for physical activity. Even a 10-20 minute walk after a meal can help to lower your blood glucose, lower your insulin resistance, reduce stress, and clear your mind.',
      sources: [
        {
          title: 'Protective effects of physical activity against health risks associated with type 1 diabetes: "Health benefits outweigh the risks"',
          url: 'https://pubmed.ncbi.nlm.nih.gov/35432757/'
        },
        {
          title: 'Walking When You Have Diabetes',
          url: 'https://www.diabetes.org.uk/guide-to-diabetes/managing-your-diabetes/exercise/walking-with-diabetes#benefits'
        }
      ]
    },
    HIGH_TIR: {
      tips: [
        `You're doing incredible! Keep it up!`,
        `You're doing great! Keep drinking plenty of water and getting some physical activity each day.`,
        `A poor night's sleep can decrease your insulin sensitivity the following day.`,
      ],
      sources: [
        {
          title: 'Partial Sleep Restriction Decreases Insulin Sensitivity in Type 1 Diabetes',
          url: 'https://diabetesjournals.org/care/article/33/7/1573/39411/Partial-Sleep-Restriction-Decreases-Insulin'
        }
      ]
    },
    LOW_TIR: {
      tips: [
        `Don't worry about days that aren't perfect, we all have them! Keep working to get to the goal of 70% time in range and an A1C of 7.0 or lower.`,
        `Time in range (or TIR) means the amount of time in a day you spend between 70 and 180 mg/dL.`,
        `A1C and TIR have been shown to predict and help prevent long-term complications from diabetes.`
      ],
      sources: [
        {
          title: 'CGM & Time in Range',
          url: 'https://diabetes.org/tools-support/devices-technology/cgm-time-in-range'
        }
      ]
    },
    HYPO: {
      tips: [
        'Hypoglycemia, or low blood sugar, can cause you to feel hungry, shaky, tired, confused, or dizzy.',
        `If left untreated, hypoglycemia can lead to slurred speech, confusion, drowsiness, and can lead to seizures or fainting.`,
        'The standard treatment for hypoglycemia is 15 grams of fast-acting carbs, waiting 15 minutes, and then checking blood sugar.'
      ],
      sources: [
        {
          title: 'More about Hypoglycemia',
          url: 'https://diabetes.org/healthy-living/medication-treatments/blood-glucose-testing-and-control/hypoglycemia'
        }
      ]
    },
    HYPER: {
      tips: [
        'High blood sugar, or hyperglycemia, can cause mood swings, thirst, hunger, and rapid heartbeat.',
        'High blood sugar can decrease your insulin sensitivity through a process known as glucotoxicity.',
        'After 3+ hours of hyperglycemia, ketones can develop in your bloodstream.',
        'If left untreated, hyperglycemia can lead to diabetic ketoacidosis (or DKA).'
      ],
      sources: [
        {
          title: 'More about Hyperglycemia',
          url: 'https://diabetes.org/healthy-living/medication-treatments/blood-glucose-testing-and-control/hyperglycemia'
        }
      ]
    },
    CGM: {
      tips: [
        `Devices like CGMs are life changing, but only a fraction of people with T1D actually have access to them.`
      ]
    }
  };

  // Time
  const MINUTE_INCREMENTS = 5;
  const INCREMENTS_IN_A_DAY = 288;

  // Internal State
  let timeoutId;

  // View State
  let mouseX;
  let mouseY;
  let message;
  let showDebugPanel = false;
  let isLocal = isLocalhost();

  let hasSeenHypoMessage = false;
  let hasSeenHyperMessage = false;
  let hasSeenFeelMessage = false;

  // Game Data
  let bgData = createRange(0, INCREMENTS_IN_A_DAY);
  let slicedBgData = [];
  let futureBgEffects = createRange(0, INCREMENTS_IN_A_DAY, 1, 0);
  let futureCgmEffects = createRange(0, INCREMENTS_IN_A_DAY, 1, 0);
  let futureCarbsOnBoard = createRange(0, INCREMENTS_IN_A_DAY, 1, 0);
  let futureInsulinOnBoard = createRange(0, INCREMENTS_IN_A_DAY, 1, 0);
  let futureEvents = {};
  let timeAnnotations = [];

  // Game Settings
  let gameSpeed = 300;
  let gameSpeedValue = 3;
  let jitterAmount = 1;

  let mmol = false;
  let noCGM = false;
  let pumpType = 'manual';
  let personWeight = 50;

  // View Settings
  let hoursDisplayed = 3;

  let clockId = 0;
  let currentHour = 0;
  let dayNumber = 1;
  let gameTurn = 1;
  let gameTime = offsetDateByHours(setToBeginningOfDay(new Date()), 7);
  let startTime = new Date(gameTime);
  let formattedGameTime;

  // Player attributes
  let baseInsulinSensitivity = 70;
  let insulinSensitivity = baseInsulinSensitivity;
  let carbSensitivity = 5;
  let currentBg = 120;
  let currentVelocity = 0;
  let currentCgmValue = currentBg;
  let lastGoodCgmValue = currentBg;

  let insulinOnBoard = 0;
  let carbsOnBoard = 0;

  let dailyCounts = resetDailyCounts();

  // Sensor state
  const MAX_SENSOR_LIFESPAN = INCREMENTS_IN_A_DAY * 10;
  let sensorsLeft = 2;
  let sensorLifespan = (INCREMENTS_IN_A_DAY * 2) + (12 * 12); // 7am + 12 hours = 7pm
  let sensorExpired = false;
  let sensorError = false;
  let sensorWarmup = false;
  let dailyStats = [];

  // Pump settings
  const MAX_PUMP_LIFESPAN = INCREMENTS_IN_A_DAY * 3;
  let pumpsLeft = 12;
  let pumpExpired = false;
  let pumpSite = randomValueFrom(PUMP_SITES);
  let pumpLifespan = (INCREMENTS_IN_A_DAY * 1) + (12 * 9); // 7am + 9 hours = 4pm
  let pumpFlowAmount = 1;
  let targetBg = 150;
  let correctionFactor = 120;
  let maxBolus = 20;
  let carbRatios = [
    { startHour: 0, endHour: 6, ratio: 20 },
    { startHour: 6, endHour: 10, ratio: 14 },
    { startHour: 10, endHour: 14, ratio: 17 },
    { startHour: 14, endHour: 20, ratio: 22 },
    { startHour: 20, endHour: 24, ratio: 20 },
  ];
  let basalProgram = [
    { startHour: 0, endHour: 4, rate: 0.3 },
    { startHour: 4, endHour: 8, rate: 0.4 },
    { startHour: 8, endHour: 12, rate: 0.25 },
    { startHour: 12, endHour: 16, rate: 0.2 },
    { startHour: 16, endHour: 20, rate: 0.2 },
    { startHour: 20, endHour: 24, rate: 0.2 }
  ];

  // Game flags
  let gameIsRunning = true;
  let isGameOver = false;

  // Player flags
  let isAwake = true;
  let isYawning = false;
  let shouldBeAsleep = false;
  let justAlarmed = false;
  let justDrankWater = false;
  let isRested = true;
  let isExercising = false;
  let lastPhantomFood = 0;

  let lastAction = false;

  let ketonesLevel = 0;
  let caffeineLevel = 0;
  let hydrationLevel = 0;
  let exerciseLevel = 0;
  let stressLevel = isWeekDay() ? 1 : 0;
  let sicknessLevel = 0;

  ////////////////////////////////////////////

  function resetDailyCounts() {
    return {
      bolusInsulin: 0,
      mealCount: 0,
      basalInsulin: 0,
      waterCount: 0,
      exerciseCount: 0,
      carbsEaten: 0,
      sicknessCount: 0,
      sleepInterruptions: 0
    };
  }

  function yScale(n) {
    let v = scaleLinear(n, [MIN_V, MAX_V], [100, 0]);
    return Math.max(0, Math.min(v, 100));
  }

  function xScale(n) {
    let minValue = 0;
    let maxValue = 12 * hoursDisplayed;
    let v = scaleLinear(n, [minValue, maxValue], [100, 0]);

    return Math.max(0, Math.min(v, 100));
  }

  function convertWeightToCarbSensitivity() {
    // Ref: https://diatribe.org/treating-hypos-one-size-does-not-fit-all
    // "The bigger you are, the more carbohydrates it takes to raise the blood sugar.
    // This is because bigger people have more blood volume into which the glucose will dissolve."
    if (personWeight < 100) {
      return 5;
    }
    if (personWeight < 160) {
      return 4;
    }
    if (personWeight < 220) {
      return 3;
    }
    return 2;
  }

  function showMessage(obj) {
    message = obj;
    gameIsRunning = false;
    window.scrollTo(0, 0);
  }

  function closeDialog() {
    message = null;
    // Deferring to allow the MessageDialog component to clean up after itself.
    setTimeout(() => {
      gameIsRunning = true;
      nextTurn();
    }, 500);
  }

  function getVelocity(currentValue, lookback = 4) {
    if (bgData.length <= lookback) {
      return 0;
    }

    let oldValue = bgData[bgData.length - lookback].bgValue;
    return oldValue ? currentValue - oldValue : 0;
  }

  function setArrowRotation(currentValue) {
    let velocity = getVelocity(currentValue);

    if (velocity > 24) {
      return -90;
    } else if (velocity < -24) {
      return 90;
    } else if (velocity > 8) {
      return -45;
    } else if (velocity < -8) {
      return 45;
    }

    return 0;
  }

  function handleEvents() {
    let events = futureEvents[gameTurn];
    if (events) {
      for (let fn of events) {
        fn();
      }
      futureEvents[gameTurn] = null;
    }
  }

  function addFutureEvent(turn, fn) {
    let actualTurn = gameTurn + turn;

    futureEvents[actualTurn] = futureEvents[actualTurn] || [];
    futureEvents[actualTurn].push(fn);
  }

  function getEmojiForBg(bg) {
    if (isAwake === false) {
      return '😴';
    }
    if (bg >= VERY_HIGH_RANGE) {
      return '😰';
    }
    if (bg >= UPPER_RANGE) {
      return sicknessLevel > 0 ? '🤒' : '🫤';
    }
    if (bg <= UPPER_RANGE && bg > LOWER_RANGE) {
      return sicknessLevel > 0 ? '🤒' : (shouldBeAsleep || isYawning) ? '🥱' : isRested ? '🙂' : '😐';
    }
    if (bg <= LOWER_RANGE && bg > VERY_LOW_RANGE) {
      return sicknessLevel > 0 ? '🤒' : '😣';
    }
    if (bg <= VERY_LOW_RANGE) {
      return '😵‍💫';
    }
  }

  function createSineWave(multiplier, turnOffset = 0) {
    return Math.sin(multiplier * (gameTurn + turnOffset));
  }

  function getTimeOfDayAdjustment() {
    // TODO: Make this modulate slowly over time
    if (currentHour > 16) {
      // Dinner
      return 1.25;
    } else if (currentHour > 11) {
      // Lunch
      return 1.15;
    } else {
      // Overnight + Breakfast
      return 0.8;
    }
  }

  function adjustSensitivities() {
    // Ref: https://www.fitterfly.com/blog/why-do-people-with-diabetes-need-to-worry-about-glucotoxicity/
    let glucoToxicityAdjustment = currentBg > 240 ? 0.7 : currentBg > 200 ? 0.8 : 1;

    let sicknessAdjustment = sicknessLevel > 2 ? 0.6 : sicknessLevel > 1 ? 0.7 : sicknessLevel > 0 ? 0.8 : 1;
    let stressAdjustment = stressLevel > 2 ? 0.8 : stressLevel > 0 ? 0.9 : 1;
    let hydrationAdjustment = hydrationLevel > 3 ? 1.1 : hydrationLevel > 1 ? 1.05 : 0.9;
    let exerciseAdjustment = exerciseLevel > 1 ? 1.15 : exerciseLevel === 1 ? 1.1 : 1;
    let timeOfDayAdjustment = getTimeOfDayAdjustment();

    // Ref: https://diabetesjournals.org/care/article/33/7/1573/39411/Partial-Sleep-Restriction-Decreases-Insulin
    // "The results indicate that a single night of partial sleep restriction reduces insulin sensitivity of insulin-stimulated glucose uptake by 14–21%."
    let sleepAdjustment = isRested ? 1 : 0.9;

    insulinSensitivity = baseInsulinSensitivity
      * sleepAdjustment
      * timeOfDayAdjustment
      * exerciseAdjustment
      * glucoToxicityAdjustment
      * stressAdjustment
      * sicknessAdjustment
      * hydrationAdjustment;

    // Carb sensitivity is based on weight
    // Ref: https://diatribe.org/treating-hypos-one-size-does-not-fit-all
    carbSensitivity = convertWeightToCarbSensitivity();
  }

  function applyJitter(currentBg) {
    let behavior = Math.random();
    let jitter;

    if (behavior < 0.2) {
      jitter = createSineWave(0.8, 0) * 5;
    } else if (behavior < 0.9) {
      jitter = Math.random() * (jitterAmount * 0.75);
    } else {
      jitter = Math.random() * (jitterAmount * 2);
    }

    return currentBg - jitter;
  }

  function getClockId() {
    return Math.floor(secondsSoFar(gameTime) / (60 * 5));
  }

  function calculateDailyStats() {
    let values = bgData.slice(bgData.length - INCREMENTS_IN_A_DAY).filter(o => o.bgValue).map(o => o.bgValue);
    let stats = {
      bgData: values,
      percentages: getPercentages(values),
      avg: mean(values)
    };

    stats.a1c = calculateA1C(stats.avg);
    stats.avg = Math.round(stats.avg);
    stats.stdDev = Math.round(stdDev(values));

    return stats;
  }

  function convertToUnit(bg) {
    if (mmol) {
      return oneDecimal(bg / 18);
    } else {
      return Math.round(bg);
    }
  }

  function printUnit() {
    return mmol ? 'mmol/L' : 'mg/dL';
  }

  function isMMOL() {
    return mmol;
  }

  function getRanges() {
    return {
      max: MAX_V,
      veryHigh: VERY_HIGH_RANGE,
      high: UPPER_RANGE,
      low: LOWER_RANGE,
      veryLow: VERY_LOW_RANGE,
      min: MIN_V
    };
  }

  function getPercentages(values) {
    const len = values.length;
    const ranges = getRanges();

    return {
      veryHigh: (values.filter(v => { return v > ranges.veryHigh }).length / len) * 100,
      high: (values.filter(v => { return v > ranges.high && v <= ranges.veryHigh }).length / len) * 100,
      inRange: (values.filter(v => { return v <= ranges.high && v >= ranges.low }).length / len) * 100,
      low: (values.filter(v => { return v < ranges.low && v >= ranges.veryLow }).length / len) * 100,
      veryLow: (values.filter(v => { return v < ranges.veryLow }).length / len) * 100
    };
  }

  function calculateA1C(avg) {
    // Ref: https://professional.diabetes.org/diapro/glucose_calc
    // "The relationship between A1C and eAG is described by the formula 28.7 X A1C – 46.7 = eAG."
    const A1C = (avg + 46.7) / 28.7;

    return oneDecimal(A1C);
  }

  function showDailyRecap() {
    let stats = calculateDailyStats();
    dailyStats.push(stats);

    showMessage({
      wide: true,
      align: 'top',
      text: `Here's Your Day ${dayNumber} Recap:`,
      component: DailyRecap,
      componentProps: {
        stats,
        noCGM,
        convertToUnit,
        printUnit,
        dailyCounts,
      },
      didYouKnow: getTip(stats, dailyCounts)
    });
  }

  function getTip(stats, dailyCounts) {
    if (noCGM) {
      return randomValueFrom(TIPS.CGM.tips);
    }

    let notEnoughWater = dailyCounts.waterCount < 3;
    let notEnoughActivity = dailyCounts.exerciseCount === 0;
    let notSickToday = sicknessLevel === 0 && dailyCounts.sicknessCount === 0;

    if (notEnoughWater && notEnoughActivity && notSickToday) {
      let tipName = randomValueFrom(['WATER', 'ACTIVITY']);
      return TIPS[tipName].tip;
    }

    if (notEnoughWater) {
      return TIPS.WATER.tip;
    }

    if (notEnoughActivity && notSickToday) {
      return TIPS.ACTIVITY.tip;
    }

    if (stats.percentages.inRange >= 70) {
      return randomValueFrom(TIPS.HIGH_TIR.tips);
    }

    return randomValueFrom(TIPS.LOW_TIR.tips);
  }

  function isWeekDay() {
    let day = gameTime.getDay();

    return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
  }

  function resetDailyEvents() {
    showDailyRecap();

    dailyCounts = resetDailyCounts();

    // This is simplistic obviously, but I've seen first-hand that school/week days
    // are often more stressful and can lead to higher insulin resistance than weekends.
    stressLevel = 0;
    if (isWeekDay()) {
      stressLevel = randomInt(1, 2);
    }
    if (!isRested) {
      stressLevel += 1;
    }

    baseInsulinSensitivity = randomInt(60, 90);

    let sensorErrorThreshold = hydrationLevel > 2 ? 0.05 : 0.15;
    if (Math.random() < sensorErrorThreshold) {
      addFutureEvent(randomInt(0, INCREMENTS_IN_A_DAY), createSensorError);
      if (Math.random() < 0.1) {
        addFutureEvent(randomInt(0, INCREMENTS_IN_A_DAY), createSensorError);
      }
    }

    // Trigger event
    if (Math.random() < 0.1) {
      if (sicknessLevel === 0) {
        addFutureEvent(randomInt(0, INCREMENTS_IN_A_DAY), becomeSick);
      }
    }
  }

  function becomeSick() {
    if (sicknessLevel > 0) {
      return false;
    }

    let sickness = randomInt(1, 3);
    showMessage({
      emoji: '🤒',
      text: sickness === 1 ? `You've come down with a cold.` : `You've come down with a bad flu.`,
      didYouKnow: 'Insulin resistance can go up while you have a virus or other illness. You might need more insulin than usual until you feel better.'
    });
    sicknessLevel += sickness;
    dailyCounts.sicknessCount += sickness;

    let sickDuration = (INCREMENTS_IN_A_DAY * 2) + Math.round((Math.random() * 1) * INCREMENTS_IN_A_DAY);
    addFutureEvent(sickDuration, () => {
      showMessage({
        emoji: '😮‍💨',
        text: `Your ${sickness === 1 ? 'cold' : 'flu'} is gone.`
      });
      sicknessLevel = 0;
    });
  }

  function createSensorError() {
    if (sensorError === false) {
      lastGoodCgmValue = currentCgmValue;
      sensorError = true;
      addFutureEvent(randomInt(7, 24), () => {
        sensorError = false;
      });
    }
  }

  function createCompressionLow() {
    let duration = Math.ceil(Math.random() * 10) + 3;
    let delay = Math.round(Math.random() * 60);
    let amount = currentBg * ((Math.random() * 3) + 1);

    for (let t = 0; t < duration; t++) {
      let value = amount * exponentialInsulinCurve(t, Math.round(duration / 2), duration);
      futureCgmEffects[t + delay] -= value;
    }
  }

  function setTimeAnnotations() {
    let a = [];

    let hourInc = hoursDisplayed / 3;

    let lastHour = setToBeginningOfHour(new Date(gameTime));

    // if this is 6, 12, or 24hr, we want to spread out the most recent hour displayed
    if (hourInc > 1) {
      let hourOffset = lastHour.getHours() % hourInc;
      lastHour.setHours(lastHour.getHours() - hourOffset);
    }

    let value = (gameTime.getTime() - lastHour.getTime()) / (ONE_MINUTE * 5);
    a.push({ value, name: formatDate(lastHour, 'g A') });

    lastHour.setHours(lastHour.getHours() - hourInc);
    value = (gameTime.getTime() - lastHour.getTime()) / (ONE_MINUTE * 5);
    a.push({ value, name: formatDate(lastHour, 'g A') });

    lastHour.setHours(lastHour.getHours() - hourInc);
    value = (gameTime.getTime() - lastHour.getTime()) / (ONE_MINUTE * 5);
    a.push({ value, name: formatDate(lastHour, 'g A') });

    timeAnnotations = a;
  }

  // We assume some natural mechanism that dampens blood sugar dropping below 30-40, such that it would
  // take exponentially more insulin to drop from 30 to 20 compared to 100 to 90.
  //
  // Ref: https://allnurses.com/lowest-blood-sugar-seen-t145465/
  // Ref: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2699723/
  // "In univariate analysis of a subset of 338 admissions for which any hypoglycemia was documented,
  // the mean lowest recorded blood glucose was 31.8 mg/dl for patients who died in the hospital vs.
  // 40 mg/dl for those who did not (P = 0.028)."
  function slowDownIAlreadyfHypo(bgEffect) {
    if (currentBg < VERY_LOW_RANGE && bgEffect < 0) {
      let distanceFromHypoLevel = VERY_LOW_RANGE - currentBg;
      let reducedEffect = bgEffect / Math.max(1, (distanceFromHypoLevel * 0.25));
      return reducedEffect;
    }

    return bgEffect;
  }

  function renderBg() {
    // Guard against NaN:
    if (isNaN(lastGoodCgmValue)) {
      return '---';
    }

    if (lastGoodCgmValue < MIN_V) {
      return 'LOW';
    } else if (lastGoodCgmValue > MAX_V) {
      return 'HIGH';
    }

    return `${convertToUnit(lastGoodCgmValue)} ${printUnit()}`;
  }

  function setTitle() {
    document.title = `${renderBg()} | Type 1 Simulator`;
  }

  function nextTurn() {
    if (!gameIsRunning || isGameOver) {
      return;
    }

    gameTurn += 1;

    gameTime.setMinutes(gameTime.getMinutes() + MINUTE_INCREMENTS);

    // We need to do this to trigger a reactive update:
    gameTime = gameTime;

    formattedGameTime = formatDate(gameTime, 'D g:i a');
    dayNumber = Math.ceil(diffInMilliseconds(startTime, gameTime) / ONE_DAY);

    clockId = getClockId();

    let newCurrentHour = Math.floor(clockId / 12);
    if (newCurrentHour !== currentHour) {
      applyBasal();
    }
    currentHour = newCurrentHour;

    // 7am, rise and shine!
    if (clockId === 84) {
      resetDailyEvents();
      isAwake = true;
      shouldBeAsleep = false;

      if (gameSpeedValue === 7) {
        gameSpeedValue = 3;
      }
    }

    // 8am, breakfast time
    if (clockId === 96) {
      showBreakfastDialog();
    }

    // 10am, crash before lunch
    if (clockId / 12 === 10) {
      crashBeforeMeal();
    }

    // 12pm, lunch time
    if (clockId === 144) {
      showLunchDialog();
    }

    // 4pm, crash before dinner
    if (clockId / 12 === 16) {
      crashBeforeMeal();
    }

    // 6pm, dinner time
    if (clockId === 216) {
      showDinnerDialog();
    }

    // 11pm, time to go to bed!
    if (clockId === 276) {
      isAwake = false;
      shouldBeAsleep = true;
      isRested = true;
      dailyCounts.sleepTime = 0;

      if (Math.random() < 0.2) {
        createCompressionLow();
        if (Math.random() < 0.2) {
          createCompressionLow();
        }
      }
    }

    if (shouldBeAsleep && !isAwake) {
      dailyCounts.sleepTime += 1;
    }

    setTimeAnnotations();
    adjustSensitivities();

    currentBg = parseFloat(currentBg);

    futureBgEffects.push(0);
    futureCgmEffects.push(0);
    futureCarbsOnBoard.push(0);
    futureInsulinOnBoard.push(0);

    let currentBgEffect = futureBgEffects.shift();
    let currentCgmEffect = futureCgmEffects.shift();
    insulinOnBoard = futureInsulinOnBoard.shift();
    carbsOnBoard = futureCarbsOnBoard.shift();

    currentBg += slowDownIAlreadyfHypo(currentBgEffect);

    currentCgmValue = applyJitter(currentBg) + currentCgmEffect;

    if (!noCGM && !sensorError && !sensorWarmup && !sensorExpired) {
      lastGoodCgmValue = currentCgmValue;
    }

    bgData.push({
      bgValue: (noCGM || sensorError || sensorWarmup || sensorExpired) ? '' : currentCgmValue
    });

    slicedBgData = sliceBgData(bgData);
    currentVelocity = getVelocity(currentCgmValue, 2);

    handleWakeupAlarms();
    handleDaytimeAlarms();
    handleFeels();
    handleEvents();
    checkForExpiredSensor();
    checkForExpiredPump();
    setTitle();

    if (!isRested && !isYawning && isAwake && !shouldBeAsleep && Math.random() < 0.1) {
      isYawning = true;
      addFutureEvent(4, () => {
        isYawning = false;
      });
    }

    if (!sensorError && currentVelocity > 30 && Math.random() < 0.4) {
      createSensorError();
    }

    if (Math.random() < lastPhantomFood) {
      lastPhantomFood = 0;
      phantomFood();
    } else {
      lastPhantomFood += shouldBeAsleep ? 0.01 : 0.025;
    }

    checkForDKA();
    checkForHypo();

    if (Math.random() < 0.25) {
      jitterAmount = Math.random() * 5;
    }

    setNextGameLoop();
  }

  function handleFeels() {
    if (noCGM && isAwake) {
      if (currentBg < LOWER_RANGE && !hasSeenFeelMessage) {
        hasSeenFeelMessage = true;
        showMessage({
          emoji: '😵‍💫',
          text: 'You feel very hungry.',
          didYouKnow: randomValueFrom(TIPS.HYPO.tips)
        });
      } else if (currentBg > VERY_HIGH_RANGE && !hasSeenFeelMessage) {
        hasSeenFeelMessage = true;
        showMessage({
          emoji: '😣',
          text: 'You feel very thirsty.',
          didYouKnow: randomValueFrom(TIPS.HYPER.tips)
        });
      } else if (currentBg <= VERY_HIGH_RANGE && currentBg >= LOWER_RANGE) {
        hasSeenFeelMessage = false;
      }
    }
  }

  function handleDaytimeAlarms() {
    // Slow down game speed so player can react to hypo
    if (!noCGM && !shouldBeAsleep && !sensorError && !sensorExpired && !sensorWarmup) {
      if (currentCgmValue < LOWER_RANGE) {
        if (gameSpeedValue > 1) {
          gameSpeedValue = 1;
        }
        if (!hasSeenHypoMessage && !message) {
          showMessage({
            emoji: '⚡️',
            text: 'Your Low Glucose alarm went off.',
            didYouKnow: randomValueFrom(TIPS.HYPO.tips)
          });
          hasSeenHypoMessage = true;
        }
      }

      if (currentCgmValue > VERY_HIGH_RANGE) {
        if (!hasSeenHyperMessage && !message) {
          showMessage({
            emoji: '⚡️',
            text: 'Your High Glucose alarm went off.',
            didYouKnow: randomValueFrom(TIPS.HYPER.tips)
          });
          hasSeenHyperMessage = true;
        }
      }
    }
  }

  function checkForExpiredPump() {
    if (pumpLifespan > 0) {
      pumpLifespan -= 1;

      if (pumpLifespan === 0) {
        showMessage({
          emoji: '⏲',
          text: 'Your insulin pump expired.',
          note: `Each pump lasts up to 3 days. You have ${pluralize(pumpsLeft, 'pump', 'pumps')} left.`
        });
        pumpExpired = true;
        gameSpeedValue = 1;
      }
    }
  }

  function checkForExpiredSensor() {
    if (!noCGM && sensorLifespan > 0) {
      sensorLifespan -= 1;

      if (sensorLifespan === 0) {
        showMessage({
          emoji: '⏲',
          text: 'Your sensor expired.',
          note: `Each sensor lasts up to 10 days. You have ${pluralize(sensorsLeft, 'sensor', 'sensors')} left. You can place a pharmacy order for three more sensors at the end of each 30 day period.`
        });
        sensorExpired = true;
        sensorError = false;
        gameSpeedValue = 1;
      }
    }
  }

  function checkForHypo() {
    if (currentBg <= 20) {
      showMessage({
        emoji: '🚑',
        text: `You've passed out from hypoglycemia`,
        note: 'Someone called an ambulance for you. If left untreated, hypoglycemia can be life-threatening, lead to seizures or coma, as well as increase the risk of long-term complications.',
        onClose: () => {
          showGameOverMessage();
        }
      });

      isGameOver = true;
    }
  }

  function showGameOverMessage() {
    showMessage({
      wide: true,
      align: 'top',
      component: GameOver,
      componentProps: {
        dayNumber
      },
      useDefaultAction: false
    });
  }

  function checkForDKA() {
    if (currentBg > VERY_HIGH_RANGE) {
      ketonesLevel += scaleLinear(currentBg, [250, 500], [0.4, 1]);
    }

    if (ketonesLevel > DKA_LEVEL_KETONES) {
      showMessage({
        emoji: '🚑',
        text: 'You have DKA.',
        note: 'Time to go to the ER. If left untreated, diabetic ketoacidosis can be life-threatening, lead to seizures or coma, as well as increase the risk of long-term complications.',
        onClose: () => {
          showGameOverMessage();
        }
      });

      isGameOver = true;
    }
  }

  function handleWakeupAlarms() {
    if (!isAwake && !justAlarmed && !noCGM && !sensorError && !sensorExpired && !sensorWarmup) {
      let isHypo = currentCgmValue < LOWER_RANGE;
      let isHyper = currentCgmValue > VERY_HIGH_RANGE;
      if (isHypo || isHyper) {
        showMessage({
          emoji: '⚡️',
          text: `Your ${isHyper ? 'high' : 'low'} glucose alarm woke you up.`,
          didYouKnow: randomValueFrom(isHyper ? TIPS.HYPER.tips : TIPS.HYPO.tips)
        });
        justAlarmed = true;
        isAwake = true;
        dailyCounts.sleepInterruptions += 1;
        isRested = false;
        gameSpeedValue = 1;
        setHoursDisplayed(3);
        addFutureEvent(12, () => {
          justAlarmed = false;
        });
      }
    }
  }

  function getCurrentCarbRatio() {
    let match = carbRatios.find(ratio => {
      return ratio.startHour <= currentHour && ratio.endHour > currentHour;
    });

    return match.ratio;
  }

  function getCurrentBasalRate() {
    let match = basalProgram.find(segment => {
      return segment.startHour <= currentHour && segment.endHour > currentHour;
    });

    return match.rate;
  }

  function applyBasal() {
    let basal = getCurrentBasalRate();
    applyInsulinOnBoard(basal);
  }

  function showFoodDialog(foods, mealName) {
    showMessage({
      component: MockMealForm,
      componentProps: {
        foods,
        mealName,
        carbRatio: getCurrentCarbRatio(),
        correctionFactor,
        insulinOnBoard,
        maxBolus,
        printUnit,
        convertToUnit,
        selectedFood: false,
        currentBg,
        targetBg,
      },
      useDefaultAction: false,
      wide: true,
      align: 'top',
      onClose: ({ food, bolusAmount, bolusTiming }) => {
        function applyCarbs() {
          food.absorption.forEach(a => {
            applyCarbsOnBoard(a.carbs, a.duration, a.delay);
          });
          dailyCounts.carbsEaten += food.carbs;

          // Ref: https://www.woundsinternational.com/uploads/resources/dotn/_master/3507/files/pdf/dccyp2-2-68-70.pdf
          // Ref: https://youngandt1.com/how-to-bolus-for-fat-and-protein/
          // 1 FPU (fat/protein unit) = 100 kcal of energy from fat/protein
          // 1 FPU = 10 gms of extra carb added to total carb count
          let proteinAbsorption = ABSORPTION_RATES.PROTEIN;
          let calorieDist = calculateCalorieDistribution(food);
          let fpu = calorieDist.protein + calorieDist.fat;
          let fpuDampening = 30; // 10 seems way off, based on testing
          console.log({ food, fpu, calorieDist });
          applyCarbsOnBoard(fpu / fpuDampening, proteinAbsorption.duration, proteinAbsorption.delay, true);
        }
        function applyBolus() {
          console.log('applyBolus', { bolusAmount });
          applyInsulinOnBoard(bolusAmount);
        }

        if (bolusTiming === 0) {
          // Eat and bolus at the same time
          applyCarbs();
          applyBolus();
        } else if (bolusTiming > 0) {
          // Eat meal, then bolus
          let futureEventTime = Math.ceil(bolusTiming / 5);
          console.log({ futureEventTime });
          applyCarbs();
          addFutureEvent(futureEventTime, applyBolus);
        } else {
          // Pre-bolus, then eat
          let futureEventTime = Math.ceil(Math.abs(bolusTiming) / 5);
          console.log({ futureEventTime });
          applyBolus();
          addFutureEvent(futureEventTime, applyCarbs);
        }

        closeDialog();
      }
    });
  }

  function giveInsulin() {
    showMessage({
      component: MockCorrectionForm,
      componentProps: {
        carbRatio: getCurrentCarbRatio(),
        correctionFactor,
        maxBolus,
        insulinOnBoard,
        printUnit,
        convertToUnit,
        currentBg,
        targetBg,
      },
      useDefaultAction: false,
      align: 'top',
      wide: true,
      onClose: (bolusAmount) => {
        applyInsulinOnBoard(bolusAmount);
        dailyCounts.bolusInsulin += bolusAmount;
        setLastAction(ACTIONS.INSULIN);

        closeDialog();
      }
    });
  }

  function showBreakfastDialog() {
    let foods = getRandomBreakfastFoods();
    showFoodDialog(foods, 'breakfast');
  }

  function showLunchDialog() {
    let foods = getRandomLunchFoods();
    showFoodDialog(foods, 'lunch');
  }

  function showDinnerDialog() {
    let foods = getRandomDinnerFoods();
    showFoodDialog(foods, 'dinner');
  }

  function goBackToSleep() {
    isAwake = false;
  }

  function sliceBgData(bgData) {
    let len = bgData.length;
    let maxDots = hoursDisplayed * 12;

    if (len >= maxDots) {
      return bgData.slice(len - maxDots, len);
    }

    return bgData;
  }

  function displayCurrentBg(bg) {
    if (bg < MIN_V) {
      return 'LOW';
    } else if (bg > MAX_V) {
      return 'HIGH';
    }

    return convertToUnit(bg);
  }

  // function toggleGameState() {
  //   gameIsRunning = !gameIsRunning;

  //   setNextGameLoop();
  // }

  function setHoursDisplayed(hours) {
    hoursDisplayed = hours;
    slicedBgData = sliceBgData(bgData);
    setTimeAnnotations();
  }

  function setNextGameLoop() {
    if (gameIsRunning) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(nextTurn, gameSpeed);
    }
  }

  function applyInsulinOnBoard(totalBolus, silent = false) {
    const absorption = ABSORPTION_RATES.INSULIN.RAPID;
    let delay = Math.round(Math.random() * 2);
    ketonesLevel = Math.max(0, ketonesLevel - (totalBolus * 4));

    let bolusLeft = totalBolus;

    // Introduce 10% margin of error to the actual bolus delivered
    let actualBolus = (Math.random() * (totalBolus * 0.1)) + (totalBolus * 0.9);

    // Penalize bolus amount if pump flow is reduced.
    actualBolus = actualBolus * pumpFlowAmount;

    console.log('applying insulin', { delay, totalBolus, actualBolus });

    for (let t = 0; t <= absorption.duration; t++) {
      let value = actualBolus * exponentialInsulinCurve(t, absorption.peak, absorption.duration);
      bolusLeft -= value;
      if (!silent) {
        futureInsulinOnBoard[t + delay] += bolusLeft;
      }
      futureBgEffects[t + delay] -= (value * insulinSensitivity);
    }
  }

  function applyCarbsOnBoard(countedCarbs, carbDuration, carbDelay, silent = false) {
    // 3% uncertainty in carb calculation
    let jitter = Math.random(countedCarbs * 0.06) - (countedCarbs * 0.03);
    let actualCarbs = countedCarbs + jitter;
    let carbsLeft = countedCarbs;

    console.log({ countedCarbs, actualCarbs, carbDuration, carbDelay });

    for (let t = 0; t < carbDuration; t++) {
      let value = actualCarbs * walshCarbAbsorptionCurve(t, carbDuration);
      carbsLeft -= value;
      if (!silent) {
        futureCarbsOnBoard[t + carbDelay] += carbsLeft;
      }
      futureBgEffects[t + carbDelay] += (value * carbSensitivity);
    }
  }

  function crashBeforeMeal() {
    let name = randomValueFrom(['VERY_SLOW', 'SLOW']);
    let type = ABSORPTION_RATES.CARBS[name];
    let carbs = (Math.random() * 5) + 5;

    applyCarbsOnBoard(carbs * -1, type.duration, type.delay, true);
  }

  function phantomFood() {
    let name = randomValueFrom(['VERY_FAST', 'FAST', 'MEDIUM', 'SLOW', 'VERY_SLOW']);
    let type = ABSORPTION_RATES.CARBS[name];
    let carbs = (Math.random() * 10) - 5;

    applyCarbsOnBoard(carbs, type.duration, type.delay, true);

    if (Math.random() < 0.75) {
      applyCarbsOnBoard(carbs * -1, type.duration, type.duration, true);
    }
  }

  function setLastAction(name) {
    lastAction = name;
    setTimeout(() => {
      lastAction = false;
    }, 200);
  }

  function useGlucagon() {
    applyCarbsOnBoard(20, 5, 0, true);

    setLastAction(ACTIONS.GLUCAGON);
  }

  function eatPez() {
    let type = ABSORPTION_RATES.CARBS.VERY_FAST;
    applyCarbsOnBoard(5, type.duration, type.delay);
    applyCarbsOnBoard(Math.random() * -1, type.duration, type.duration, true);
    dailyCounts.carbsEaten += 5;

    setLastAction(ACTIONS.PEZ);
  }

  function drinkAppleJuice() {
    let type = ABSORPTION_RATES.CARBS.VERY_FAST;
    let carbs = randomInt(12, 16);
    applyCarbsOnBoard(carbs, type.duration, type.delay);
    applyCarbsOnBoard(Math.random() * ((carbs / 3) * -1), type.duration, type.duration, true);
    dailyCounts.carbsEaten += 15;

    setLastAction(ACTIONS.JUICE);
  }

  function drinkSoda() {
    let type = ABSORPTION_RATES.CARBS.VERY_FAST;
    let carbs = randomInt(36, 42);
    applyCarbsOnBoard(carbs, type.duration, type.delay);
    applyCarbsOnBoard(Math.random() * ((carbs / 3) * -1), type.duration, type.duration, true);

    caffeineLevel += 1;
    addFutureEvent(60, () => {
      caffeineLevel -= 1;
    });
    dailyCounts.carbsEaten += 36;

    setLastAction(ACTIONS.SODA);
  }

  function drinkWater() {
    hydrationLevel += 1;
    ketonesLevel = Math.max(0, ketonesLevel - 5);

    addFutureEvent(INCREMENTS_IN_A_DAY, () => {
      hydrationLevel -= 1;
    });

    dailyCounts.waterCount += 1;

    setLastAction(ACTIONS.WATER);
    justDrankWater = true;

    addFutureEvent(4, () => {
      justDrankWater = false;
    })
  }

  function eatPopcorn() {
    let type = ABSORPTION_RATES.CARBS.MEDIUM;
    applyCarbsOnBoard(10, type.duration, type.delay);
    dailyCounts.carbsEaten += 10;

    setLastAction(ACTIONS.POPCORN);
  }

  function eatPizza() {
    let type = ABSORPTION_RATES.CARBS.VERY_SLOW;
    applyCarbsOnBoard(36, type.duration, type.delay);
    dailyCounts.mealCount += 1;
    dailyCounts.carbsEaten += 36;

    setLastAction(ACTIONS.PIZZA);
  }

  function eatCereal() {
    let type = ABSORPTION_RATES.CARBS.FAST;
    let carbs = 30 + (Math.random() * 20);
    applyCarbsOnBoard(carbs, type.duration, type.delay);

    type = ABSORPTION_RATES.CARBS.SLOW;
    carbs = 10;
    applyCarbsOnBoard(carbs, type.duration, type.delay, true);

    dailyCounts.carbsEaten += 40;

    setLastAction(ACTIONS.CEREAL);
  }

  function moderateExercise() {
    let exerciseDuration = (Math.random() * 12) + 8;
    let exerciseAmount = (Math.random() * 40) + 50;

    dailyCounts.exerciseCount += 1;

    for (let t = 0; t < exerciseDuration; t++) {
      let value = exerciseAmount * sineAbsorptionCurve(t, exerciseDuration);
      futureBgEffects[t + 4] -= value;
    }

    exerciseLevel += 2;
    addFutureEvent(randomInt(300, 500), () => {
      exerciseLevel -= 2;
    });

    isExercising = true;
    addFutureEvent(7, () => {
      isExercising = false;

      if (stressLevel > 0) {
        stressLevel -= 1;
      }
    });
  }

  function goForAWalk() {
    dailyCounts.exerciseCount += 1;

    let exerciseDuration = (Math.random() * 12) + 6;
    let exerciseAmount = (Math.random() * 10) + 5;

    for (let t = 0; t < exerciseDuration; t++) {
      let value = exerciseAmount * sineAbsorptionCurve(t, exerciseDuration);
      futureBgEffects[t + 4] -= value;
    }

    exerciseLevel += 1;
    addFutureEvent(randomInt(300, 400), () => {
      exerciseLevel -= 1;
    });

    isExercising = true;
    addFutureEvent(7, () => {
      isExercising = false;

      if (stressLevel > 0) {
        stressLevel -= 1;
      }
    });
  }

  function testKetones() {
    // Ref: https://together.stjude.org/en-us/patient-education-resources/tests-procedures/check-urine-for-glucose-and-ketones.html
    let value = 'Negative';
    let note;
    if (ketonesLevel < 3) {
      note = `There are no ketones in your system.`;
    } else if (ketonesLevel < 6) {
      value = 'Trace';
      note = `Drink some water and take insulin to flush the ketones from your system.`;
    } else if (ketonesLevel < 15) {
      value = 'Small';
      note = `Drink water and take insulin to flush the ketones from your system.`;
    } else if (ketonesLevel < 50) {
      value = 'Moderate';
      note = `Keep drinking water and taking more insulin to flush the ketones from your system.`;
    } else {
      value = 'Large';
      note = `You're at risk of developing DKA. Keep drinking water and taking more insulin to flush the ketones from your system.`;
    }

    showMessage({
      text: `Your ketone test came back as "${value}".`,
      note
    });

    setLastAction(ACTIONS.KETONES);
  }

  function fingerStick() {
    let value = currentBg + futureBgEffects[0] + futureBgEffects[1] + futureBgEffects[2];
    let randomOffset = (value * 0.02);
    value = Math.round(value + (randomOffset - (randomOffset / 2)));

    if (noCGM || sensorError || sensorWarmup || sensorExpired) {
      bgData[bgData.length - 1].bgValue = value;
      currentCgmValue = value;
      lastGoodCgmValue = value;
    }

    showMessage({
      emoji: '🩸',
      text: `Your finger stick reads ${convertToUnit(value)} ${printUnit()}`,
      didYouKnow: 'Your sensor is around 15 minutes behind your real number, because the sensor reads interstitial fluid, instead of capillary blood.'
    });

    setLastAction(ACTIONS.FINGERSTICK);
  }

  function replaceSensor() {
    if (sensorsLeft === 0) {
      showMessage({
        text: 'You are out of sensors. Place another order through your pharmacy.'
      });
    } else {
      if (sensorsLeft > 0) {
        sensorsLeft -= 1;
      }

      sensorLifespan = MAX_SENSOR_LIFESPAN;
      sensorWarmup = true;
      sensorExpired = false;
      sensorError = false;

      addFutureEvent(24, () => {
        sensorWarmup = false;
      });

      showMessage({
        text: 'You put on a new sensor.',
        note: `It should last for 10 days. You have ${pluralize(sensorsLeft, 'sensor', 'sensors')} left after this one.`
      });
    }
  }

  function replacePump() {
    if (pumpsLeft === 0) {
      showMessage({
        text: 'You are out of insulin pumps. Place another order through your pharmacy.'
      });
    } else {
      if (pumpsLeft > 0) {
        pumpsLeft -= 1;
      }
      pumpLifespan = MAX_PUMP_LIFESPAN;
      let oldPumpSite = pumpSite;

      do {
        pumpSite = randomValueFrom(PUMP_SITES);
      } while (pumpSite === oldPumpSite);

      pumpFlowAmount = randomInt(95, 100) / 100;
      showMessage({
        text: 'You remove your expired insulin pump and put on a new one.',
        note: `You've rotated your pump site, so your new pump is on your ${pumpSite}. It should last for 3 days. You have ${pluralize(pumpsLeft, 'pump', 'pumps')} left.`
      });
    }
  }

  function openGameSettings() {
    showMessage({
      text: 'Simulator Settings',
      align: 'top',
      component: GameSettings,
      componentProps: {
        noCGM,
        pumpType,
        mmol,
        personWeight,
        onChange: (key, change) => {
          if (key === 'personWeight') {
            personWeight = change;
          } else if (key === 'pumpType') {
            pumpType = change;
          } else if (key === 'noCGM') {
            noCGM = change;
          } else if (key === 'mmol') {
            mmol = change;
          }
        }
      }
    });
  }

  function openPumpSettings() {
    showMessage({
      text: 'Pump Settings',
      wide: true,
      align: 'top',
      component: PumpSettings,
      componentProps: {
        targetBg,
        correctionFactor,
        maxBolus,
        convertToUnit,
        printUnit,
        isMMOL,
        carbRatios,
        basalProgram,
        onChange: (key, change) => {
          if (key === 'targetBg') {
            targetBg = change;
          } else if (key === 'correctionFactor') {
            correctionFactor = change;
          } else if (key === 'maxBolus') {
            maxBolus = change;
          } else if (key === 'carbRatios') {
            carbRatios = change;
          } else if (key === 'basalProgram') {
            basalProgram = change;
          }
        }
      }
    });

    setLastAction(ACTIONS.PUMP_SETTINGS);
  }

  function getClassNameForCgmValue(cgmValue) {
    if (cgmValue > VERY_HIGH_RANGE) {
      return 'hyperglycemic';
    } else if (cgmValue < LOWER_RANGE) {
      return 'hypoglycemic';
    }
  }

  function onMouseMove(e) {
    [mouseX, mouseY] = [e.clientX, e.clientY];

    showDebugPanel = isLocal && mouseX < 30 && mouseY > (window.innerHeight - 40);
  }

  function setGameSpeed(value) {
    return SPEED_VALUES[value - 1] || SPEED_VALUES[3];
  }

  function decreaseGameSpeed() {
    gameSpeedValue = Math.max(1, gameSpeedValue - 1);
  }

  function increaseGameSpeed() {
    gameSpeedValue = Math.min(7, gameSpeedValue + 1);
  }

  function openNavMenu() {
    showMessage({
      wide: true,
      text: 'Type 1 Simulator',
      align: 'top',
      component: SimulatorHelp
    });
  }

  onMount(() => {
    initColorScheme();
    nextTurn();
    showMessage({
      wide: true,
      text: 'Disclaimer',
      align: 'top',
      component: Disclaimer,
      okText: 'I Agree'
    });
    addFutureEvent(INCREMENTS_IN_A_DAY * 3 + (12 * 3), becomeSick); // 10am
  });

  $: {
    gameSpeed = setGameSpeed(gameSpeedValue);
    nextTurn();
  }

</script>

<svelte:window on:mousemove={onMouseMove}/>

<main class="hours-displayed-{hoursDisplayed}">

  {#if showDebugPanel}
    <div class="debug-panel">
      <div class="row">
        Clock ID: <code>{clockId}</code>
      </div>
      <div class="row">
        Velocity: <code>{currentVelocity}</code>
      </div>
      <div class="row">
        Sickness Level: <code>{sicknessLevel}</code>
      </div>
      <div class="row">
        Exercise Level: <code>{exerciseLevel}</code>
      </div>
      <div class="row">
        Stress Level: <code>{stressLevel}</code>
      </div>
      <div class="row">
        Hydration Level: <code>{hydrationLevel}</code>
      </div>
      <div class="row">
        Ketone Level: <code>{ketonesLevel}</code>
      </div>
      <div class="row">
        Insulin Sensitivity: <code>{insulinSensitivity}</code>
      </div>
      <div class="row">
        Carb Sensitivity: <code>{carbSensitivity}</code>
      </div>
    </div>
  {/if}

  <div class="game-container">
    <div class="top-nav">
      <div class="game-title"><h1 on:click={openGameSettings}><Menu /> Type 1 <span>Simulator</span></h1></div>
      <div class="top-right-corner">
        <button on:click={openNavMenu}>?</button>
      </div>
    </div>

    <div class="center-column">

      <div class="time-row">
        <div class="current-time">
          {formattedGameTime} {shouldBeAsleep ? '🌙' : '☀️'}
        </div>

        <div class="time-controls">
          <TextField showInput={false} hasRange={true} minValue={1} maxValue={7} stepIncrements={1} ticks={7} decreaseFn={decreaseGameSpeed} decreaseText="🐢" increaseFn={increaseGameSpeed} increaseText="🐇" bind:value={gameSpeedValue} />
        </div>
      </div>

      <div class="phone">

        {#if !noCGM}
          <div class="current-bg {sensorError || sensorWarmup || sensorExpired ? 'sensor-error' : ''}">
            {#if sensorError}
              <h2>Sensor Error</h2>
              <h3>Wait up to 3 hours</h3>
            {:else if sensorExpired}
              <h2>Sensor Expired</h2>
              <h3>Change sensor now.</h3>
            {:else if sensorWarmup}
              <h2>Sensor Warmup</h2>
              <h3>Warmup takes two hours.</h3>
            {:else}
              <div class="trend-arrow" style="transform: rotate({setArrowRotation(currentCgmValue)}deg);"><ArrowRight size={40} /></div>
              <h2 class={getClassNameForCgmValue(currentCgmValue)}>
                {displayCurrentBg(currentCgmValue)}
              </h2>
              <h3>{mmol ? 'mmol/L' : 'mg/dL'}</h3>
            {/if}
          </div>
        {/if}

        <div class="cgm-chart-controls">
          {#each [3, 6, 12, 24] as h}
            <Button className="wide {hoursDisplayed === h ? 'primary' : ''}" onClick={() => setHoursDisplayed(h)}>{h} hr</Button>
          {/each}
        </div>

        <div class="cgm-chart">
          <div class="chart-frame areas">
            <div class="in-range-bg"></div>
            <div class="low-bg"></div>
            <div class="high-bg"></div>
          </div>
          <div class="chart-frame annotations y-annotations">
            {#key mmol}
              {#each [MIN_V, LOWER_RANGE, UPPER_RANGE, VERY_HIGH_RANGE, MAX_V] as bg}
                <div class="y-annotation" style="top: {yScale(bg)}%">{convertToUnit(bg)}</div>
              {/each}
            {/key}
          </div>
          <div class="chart-frame annotations x-annotations">
            {#each timeAnnotations as annotation}
              <div class="x-annotation" style="left: {xScale(annotation.value)}%">{annotation.name}</div>
            {/each}
          </div>
          <div class="chart-frame dots">
            {#each slicedBgData as dot}
              <div class="dot-parent">
                {#if dot.bgValue}
                  <div class="dot" style="top: {yScale(dot.bgValue)}%"></div>
                {/if}
              </div>
            {/each}
          </div>
          <div class="emoji-parent" style="top: {yScale((noCGM || sensorError || sensorWarmup || sensorExpired) ? lastGoodCgmValue : currentCgmValue)}%">
            <span class="emoji">{getEmojiForBg((noCGM || sensorError || sensorWarmup || sensorExpired) ? lastGoodCgmValue : currentCgmValue)}</span>
          </div>
        </div>
      </div>

      <div class="pump-status">
        <div class="badge iob">
          Insulin on Board <strong>{oneDecimal(insulinOnBoard)}u</strong>
        </div>
        <div class="badge cob">
          Carbs on Board <strong>{Math.round(Math.max(0, carbsOnBoard))}g</strong>
        </div>
      </div>

      <div class="actions">
        <div class="action-group">
          <h3>Food</h3>
          <Button active={isAwake && lastAction !== ACTIONS.WATER && !justDrankWater} onClick={drinkWater}><div class="action-label"><div class="emoji">🚰</div> Water <span class="amount">8oz</span></div></Button>
          <Button active={isAwake && lastAction !== ACTIONS.PEZ} onClick={eatPez}><div class="action-label"><div class="emoji">🍬</div> Candy <span class="amount">5g</span></div></Button>
          <Button active={isAwake && lastAction !== ACTIONS.POPCORN} onClick={eatPopcorn}><div class="action-label"><div class="emoji">🍿</div> Popcorn <span class="amount">10g</span></div></Button>
          <Button active={isAwake && lastAction !== ACTIONS.JUICE} onClick={drinkAppleJuice}><div class="action-label"><div class="emoji">🧃</div> Juice <span class="amount">15g</span></div></Button>
          <Button active={isAwake && lastAction !== ACTIONS.SODA} onClick={drinkSoda}><div class="action-label"><div class="emoji">🥤</div> Soda <span class="amount">40g</span></div></Button>
        </div>
        <div class="action-group">
          <h3>Activity</h3>
          <Button active={isAwake && !isExercising && sicknessLevel === 0} onClick={goForAWalk}><div class="action-label"><div class="emoji">🚶</div> Go Walk <span class="amount">30m</span></div></Button>
          <Button active={isAwake && !isExercising && sicknessLevel === 0} onClick={moderateExercise}><div class="action-label"><div class="emoji">🏃‍♂️</div> Moderate Exercise <span class="amount">30m</span></div></Button>
          <Button active={isAwake && !isExercising && shouldBeAsleep} onClick={goBackToSleep}><div class="action-label"><div class="emoji">💤</div> Back to Sleep</div></Button>
        </div>
        <div class="action-group">
          <h3>Medical</h3>
          <Button active={isAwake && lastAction !== ACTIONS.INSULIN} onClick={giveInsulin}><div class="action-label"><div class="emoji">💉</div> Bolus Insulin</div></Button>
          <Button active={isAwake && lastAction !== ACTIONS.PUMP_SETTINGS} onClick={openPumpSettings}><div class="action-label"><div class="emoji">🎛</div> Pump Settings</div></Button>
          <Button active={isAwake && lastAction !== ACTIONS.FINGERSTICK} onClick={fingerStick}><div class="action-label"><div class="emoji">🩸</div> Finger Stick</div></Button>
          <Button active={isAwake && lastAction !== ACTIONS.KETONES} onClick={testKetones}><div class="action-label"><div class="emoji">🚽</div> Test Ketones</div></Button>
          <Button active={isAwake} onClick={replacePump}><div class="action-label"><div class="emoji">🔁</div> Replace Pump</div></Button>
          <Button active={isAwake && sensorExpired} onClick={replaceSensor}><div class="action-label"><div class="emoji">🔁</div> Replace Sensor</div></Button>
          <Button active={isAwake && currentCgmValue <= VERY_LOW_RANGE} onClick={useGlucagon}><div class="action-label"><div class="emoji">💉</div> Use Glucagon</div></Button>
        </div>
      </div>

    </div>
  </div>

  <MessageDialog {message} onClose={closeDialog} />

</main>

<style>

  .hours-displayed-3 {
    --cgm-chart-size-10: 6px;
    --cgm-chart-size-20: 12px;
    --cgm-chart-size-30: 24px;
    --cgm-chart-size-40: 36px;
  }

  .hours-displayed-6 {
    --cgm-chart-size-10: 3px;
    --cgm-chart-size-20: 6px;
    --cgm-chart-size-30: 12px;
    --cgm-chart-size-40: 18px;
  }

  .hours-displayed-12 {
    --cgm-chart-size-10: 1.5px;
    --cgm-chart-size-20: 3px;
    --cgm-chart-size-30: 6px;
    --cgm-chart-size-40: 9px;
  }

  .hours-displayed-24 {
    --cgm-chart-size-10: 0.75px;
    --cgm-chart-size-20: 1.5px;
    --cgm-chart-size-30: 3px;
    --cgm-chart-size-40: 4.5px;
  }

  main {
    background: var(--page-bg-color);
    box-sizing: border-box;
    min-height: 100vh;
  }

  .top-nav {
    background: var(--nav-bg-color);
    color: var(--nav-text-color);
    height: 70px;
    position: relative;
  }

  .top-right-corner {
    position: absolute;
    top: 10px;
    right: 12px;
  }

  .top-right-corner button {
    background: transparent;
    border: 0;
    color: var(--nav-text-color);
    cursor: pointer;
    display: grid;
    text-decoration: none;
    padding: 8px 20px;
    font-size: 24px;
  }

  .top-right-corner button:hover {
    color: var(--nav-text-color-selected);
  }

  .time-row {
    margin: 0 auto;
    position: relative;
    width: 500px;
  }

  .current-time {
    font-weight: var(--bold-weight);
    left: 10px;
    top: 0;
    position: absolute;
  }

  .time-controls {
    position: absolute;
    top: 4px;
    right: -14px;
    width: 220px;
  }

  .time-controls :global(div.increase) {
    width: 40px;
    right: -40px;
    font-size: 16px;
  }

  .time-controls :global(div.decrease) {
    width: 40px;
    left: -40px;
    font-size: 16px;
  }

  .game-title {
    position: absolute;
    top: 24px;
    left: 26px;
  }

  .game-title h1 {
    cursor: pointer;
    margin: 0;
    font-size: 20px;
  }

  .game-title h1 span {
    font-weight: var(--regular-weight);
  }

  .game-title h1 :global(svg) {
    opacity: 0.5;
    position: relative;
    top: 2px;
    margin: 0 5px 0 0;
  }

  .game-title h1:hover :global(svg) {
    opacity: 1;
  }

  .speed-control {
    width: 80px;
    position: relative;
    top: -6px;
    margin: 0 20px;
    height: 50px;
  }

  .phone {
    border-radius: 18px;
    padding: 34px 20px 48px 10px;
    box-shadow: 0 2px 4px var(--drop-shadow);
    background: var(--card-bg-color);
    width: 500px;
    margin: 40px auto 0;
    position: relative;
  }

  .pump-status {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin: 0 auto;
    position: relative;
    top: 14px;
    width: 500px;
  }

  .pump-status .badge {
    font-size: 14px;
    color: var(--text-color-dull);
  }

  .pump-status .badge strong {
    color: var(--text-color);
  }

  .pump-status .badge.iob {
    margin-left: 12px;
  }

  .pump-status .badge.cob {
    text-align: right;
    margin-right: 12px;
  }

  .debug-panel {
    background: var(--card-bg-color);
    box-shadow: 0 4px 18px var(--drop-shadow);
    box-sizing: border-box;
    position: fixed;
    bottom: 10px;
    left: 10px;
    padding: 28px;
    width: 240px;
  }

  .center-column {
    padding: 32px 40px;
  }

  .current-bg {
    margin: 0 auto 28px;
    text-align: center;
  }

  .current-bg h2 {
    font-size: 60px;
    line-height: 60px;
    margin: 0;
  }

  .current-bg.sensor-error h2 {
    font-size: 40px;
  }

  .trend-arrow {
    position: absolute;
    right: 165px;
    top: 47px;
  }

  h2.hypoglycemic {
    color: var(--hypo-text-color);
  }

  h2.hyperglycemic {
    color: var(--hyper-text-color);
  }

  .current-bg h3 {
    color: var(--text-color-dull);
    font-size: 18px;
    font-weight: var(--regular-weight);
    line-height: 18px;
    margin: 6px 0 0;
  }

  .cgm-chart-controls {
    display: grid;
    grid-auto-flow: column;
    justify-content: center;
    grid-gap: 2px;
    margin: 0 0 8px;
  }

  .cgm-chart {
    background: var(--card-bg-color);
    height: 160px;
    margin: 0 auto;
    position: relative;
    width: 432px;
  }

  .chart-frame {
    position: absolute;
    height: 100%;
    width: 100%;
  }

  .y-annotation {
    position: absolute;
    right: -50px;
    font-size: 12px;
    line-height: 0px;
    width: 42px;
    height: 0px;
    text-align: left;
    margin-top: -1px;
  }

  .x-annotation {
    position: absolute;
    bottom: -24px;
    font-size: 12px;
    text-align: center;
    width: 80px;
    margin: 0 0 0 -40px;
  }

  .emoji-parent {
    margin: 0;
    text-align: center;
    position: absolute;
    top: 0;
    right: -10px;
    height: 24px;
    width: 24px;
  }

  .emoji-parent .emoji {
    font-size: 24px;
    line-height: 24px;
    position: relative;
    top: -12px;
  }

  .dot-parent {
    display: inline-block;
    height: calc(100% - 2px);
    width: var(--cgm-chart-size-20);
    position: relative;
  }

  .dot {
    background: var(--text-color-bright);
    position: absolute;
    left: calc(var(--cgm-chart-size-10) - 2px);
    border-radius: 50%;
    width: 4px;
    height: 4px;
  }

  .high-bg {
    position: absolute;
    width: 100%;
    height: 41%;
    top: 0;
    background: var(--high-bg-area-color);
    box-shadow: 0 2px 0 var(--high-bg-area-border-color);
  }

  .in-range-bg {
    position: absolute;
    width: 100%;
    height: 31%;
    top: 61%;
    background: var(--in-range-bg-area-color);
  }

  .low-bg {
    position: absolute;
    background: var(--low-bg-area-color);
    box-shadow: 0 -2px 0 var(--low-bg-area-border-color);
    width: 100%;
    height: 8%;
    top: 92%;
  }

  .actions {
    border: 1px solid var(--border-color-dull);
    border-radius: 8px;
    padding: 20px 24px;
    margin: 60px 0 60px;
    display: grid;
    grid-gap: 18px;
    grid-auto-flow: column;
  }

  .actions :global(.button) {
    margin-bottom: 6px;
  }

  .actions h3 {
    font-size: 14px;
    margin: 0 0 6px;
  }

  .action-label {
    font-size: 12px;
    line-height: 12px;
    position: relative;
    min-width: 46px;
    padding-top: 20px;
    text-align: left;
  }

  .action-label .amount {
    position: absolute;
    top: -2px;
    right: -6px;
    font-size: 12px;
    font-weight: var(--regular-weight);
    color: var(--text-color-dull);
  }

  .action-label .emoji {
    position: absolute;
    top: 0px;
    left: -2px;
    font-size: 14px;
    line-height: 100%;
    margin: 0 0 4px;
  }

  @media (max-width: 520px) {
    .hours-displayed-3 {
      --cgm-chart-size-10: 4px;
      --cgm-chart-size-20: 8px;
      --cgm-chart-size-30: 12px;
      --cgm-chart-size-40: 16px;
    }

    .hours-displayed-6 {
      --cgm-chart-size-10: 2px;
      --cgm-chart-size-20: 4px;
      --cgm-chart-size-30: 6px;
      --cgm-chart-size-40: 8px;
    }

    .hours-displayed-12 {
      --cgm-chart-size-10: 1px;
      --cgm-chart-size-20: 2px;
      --cgm-chart-size-30: 3px;
      --cgm-chart-size-40: 4px;
    }

    .hours-displayed-24 {
      --cgm-chart-size-10: 0.5px;
      --cgm-chart-size-20: 1px;
      --cgm-chart-size-30: 1.5px;
      --cgm-chart-size-40: 2px;
    }

    .center-column {
      padding: 32px 0;
    }

    .cgm-chart {
      height: 140px;
      width: 300px;
    }

    .cgm-chart-controls :global(button.button.wide) {
      padding-left: 20px;
      padding-right: 20px;
    }

    .phone {
      padding: 36px 18px 40px 0px;
      width: 340px;
    }

    .pump-status {
      width: 340px;
    }

    .time-row {
      width: 340px;
    }

    .current-bg.sensor-error h2 {
      font-size: 32px;
    }

    .current-bg h2,
    .current-bg h3 {
      margin-right: -18px;
    }

    .trend-arrow {
      right: 76px;
    }
  }

</style>
