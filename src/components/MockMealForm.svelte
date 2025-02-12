<script>

  import { calcCorrection } from '../utils/calculations.js';
  import { randomValueFrom } from '../utils/array.js';
  import { roundToBasalPrecision } from '../utils/numbers.js';

  import Actions from './Actions.svelte';
  import Button from './Button.svelte';
  import DidYouKnow from './DidYouKnow.svelte';
  import MockMealFood from './MockMealFood.svelte';
  import TextField from './TextField.svelte';

  export let props;
  export let onClose;

  let mealBolusRec = 0;
  let correctionBolusRec = getCorrection();
  let totalBolusRec = 0;

  function getCorrection() {
    return calcCorrection(props.currentBg, props.targetBg, props.correctionFactor, props.insulinOnBoard);
  }

  let bolusAmount = 0;
  let bolusTiming = -10;
  let maxBolusWarning = false;

  let selectedFood = {};

  let step = 1;

  let tip1 = randomValueFrom([
    'High-carb low-fat meals tend to spike your blood sugar very quickly, which can lead to a crash shortly thereafter.',
    'The fat content in a meal slows down the time it takes for your body to process it, which leads to a longer blood glucose response.',
    'High-protein meals can sometimes cause a secondary increase in blood sugar several hours after the meal.',
    'Some studies suggest that high-fat/protein meals need more insulin than low-fat/low-protein meals with the same carb amount.'
    // Ref: https://diabetesjournals.org/care/article/36/4/810/37916/Dietary-Fat-Acutely-Increases-Glucose
    // Ref: https://diabetesjournals.org/care/article/38/6/1008/37384/Impact-of-Fat-Protein-and-Glycemic-Index-on
  ]);

  let tip2 = randomValueFrom([
    'Bolusing before a meal, or pre-bolusing, makes sense if your glucose is already high or your meal is high carb and low fat.',
    'Waiting to bolus until during or even after a meal can make sense if your glucose is low or your meal is low carb, high fat, and high protein.'
  ]);

  function continueToBolusSelection() {
    mealBolusRec = roundToBasalPrecision(selectedFood.carbs / props.carbRatio);
    totalBolusRec = roundToBasalPrecision(mealBolusRec + correctionBolusRec);
    bolusAmount = totalBolusRec;
    step = 2;
  }

  function bolusAndEatFn() {
    if (bolusAmount <= props.maxBolus) {
      onClose({
        food: selectedFood,
        bolusAmount,
        bolusTiming
      });
    }
  }

  $: {
    if (bolusAmount > props.maxBolus) {
      maxBolusWarning = true;
    } else {
      maxBolusWarning = false;
    }
  }

</script>

<div class="mock-meal-form">
  {#if step === 1}
    <h3>It's {props.mealName} time! What are you having?</h3>
    <div class="food-options">
      {#each props.foods as food (food.id)}
        <MockMealFood {food} bind:selectedFood={selectedFood} />
      {/each}
    </div>
    <DidYouKnow coach="nutritionist">{tip1}</DidYouKnow>
    <Actions align="center">
      <Button active={!!selectedFood.id} className="wide primary" onClick={continueToBolusSelection}>Continue to Bolus</Button>
    </Actions>
  {/if}
  {#if step === 2}
    <h3>Let's figure out the right bolus:</h3>
    <MockMealFood food={selectedFood} clickable={false} />
    <div class="bolus-strategy">
      <div class="calculations">
        <div class="calc-row">
          <div class="cell">Glucose</div>
          <div class="cell equation"></div>
          <div class="cell">{props.convertToUnit(props.currentBg)} {props.printUnit()}</div>
        </div>
        <div class="calc-row">
          <div class="cell">Meal Bolus</div>
          <div class="cell equation"></div>
          <div class="cell">{mealBolusRec} u</div>
        </div>
        <div class="calc-row">
          <div class="cell">Correction Bolus</div>
          <div class="cell equation"></div>
          <div class="cell">{correctionBolusRec} u</div>
        </div>
      </div>
      <div class="row has-space">
        <TextField className="oversized" hasButtons={true} minValue={0.1} maxValue={props.maxBolus} stepIncrements={0.05} label="Total Bolus" suffix="units" width="100%" labelWidth="110px" bind:value={bolusAmount} />
      </div>
      {#if maxBolusWarning}
        <div class="row">This bolus is higher than your Max Bolus setting.</div>
      {/if}
      <div class="row">
        <TextField className="oversized" hasButtons={true} minValue={-30} maxValue={30} stepIncrements={5} label="Bolus Timing" suffix="minutes" labelWidth="110px" width="100%" bind:value={bolusTiming} />
      </div>
    </div>
    <DidYouKnow coach="educator">{tip2}</DidYouKnow>
    <Actions align="center">
      <Button onClick={() => { step = 1; }}>Back</Button>
      <Button active={maxBolusWarning !== true} className="wide primary" onClick={bolusAndEatFn}>Bolus & Eat</Button>
    </Actions>
  {/if}
</div>

<style>

  .mock-meal-form {
    display: grid;
    grid-gap: 12px;
  }

  h3 {
    font-size: 18px;
    margin: 2px 0 6px;
    text-align: center;
  }

  .food-options {
    display: grid;
    grid-gap: 8px 0;
  }

  .calculations {
    margin-bottom: 12px;
  }

  .calc-row {
    display: grid;
    grid-template-columns: 158px 30px 1fr;
    margin: 0;
    padding: 0;
  }

  .calc-row .cell {
    font-size: 14px;
    color: var(--text-color-dull);
    font-weight: var(--regular-weight);
    margin: 0;
    padding: 5px 0;
    text-align: left;
  }

  .calc-row .equation {
    opacity: 0.5;
    text-align: center;
  }

  .row.has-space {
    margin-bottom: 6px;
  }

</style>
