<script>

  import { randomValueFrom } from '../utils/array.js';
  import { roundToBasalPrecision, twoDecimals } from '../utils/numbers.js';
  import { calcCorrection, calcPureCorrection } from '../utils/calculations.js';

  import Actions from './Actions.svelte';
  import Button from './Button.svelte';
  import DidYouKnow from './DidYouKnow.svelte';
  import TextField from './TextField.svelte';

  export let props;
  export let onClose;

  let carbs = 0;

  let correctionBolusRec = getCorrection();

  let bolusAmount = correctionBolusRec;
  let maxBolusWarning = false;

  function getPureCorrection() {
    return calcPureCorrection(props.currentBg, props.targetBg, props.correctionFactor);
  }

  function getCorrection() {
    return calcCorrection(props.currentBg, props.targetBg, props.correctionFactor, props.insulinOnBoard);
  }

  function submitFn() {
    if (bolusAmount <= props.maxBolus) {
      onClose(bolusAmount);
    }
  }

  function cancelFn() {
    onClose(0);
  }

  let tip = randomValueFrom([
    `It's recommended that you avoid "stacking" insulin by waiting three hours since your previous bolus.`,
    `Standard guidance is to wait three hours since your last bolus to deliver another correction bolus, to avoid "stacking" insulin.`,
    `Rapid-acting insulin typically takes 3 to 4 hours to be fully absorbed into your system, hitting its peak a little more than an hour after injection.`
  ]);

  function updateBolusAmountUsingCarbs(carbs) {
    bolusAmount = roundToBasalPrecision(getCorrection() + (carbs / props.carbRatio));
  }

  $: {
    updateBolusAmountUsingCarbs(carbs);
  }

  $: {
    if (bolusAmount > props.maxBolus) {
      maxBolusWarning = true;
    } else {
      maxBolusWarning = false;
    }
  }

</script>

<div class="mock-correction-form">
  <h3>Bolus for Carbs / Correction</h3>
  <div class="bolus-strategy">
    <div class="calculations">
      <div class="calc-row">
        <div class="cell">Current Glucose</div>
        <div class="cell equation"></div>
        <div class="cell">{props.convertToUnit(props.currentBg)} {props.printUnit()}</div>
      </div>
      <div class="calc-row">
        <div class="cell">Target Glucose</div>
        <div class="cell equation">-</div>
        <div class="cell">{props.convertToUnit(props.targetBg)} {props.printUnit()}</div>
      </div>
      <div class="calc-row">
        <div class="cell">Correction Factor</div>
        <div class="cell equation">/</div>
        <div class="cell">{Math.round(props.correctionFactor)}</div>
      </div>
      <div class="calc-row">
        <div class="cell">Correction</div>
        <div class="cell equation">=</div>
        <div class="cell is-equals">{getPureCorrection()}u</div>
      </div>
      <div class="calc-row">
        <div class="cell">Insulin on Board</div>
        <div class="cell equation">-</div>
        <div class="cell">{twoDecimals(props.insulinOnBoard)}u</div>
      </div>
      <div class="calc-row">
        <div class="cell">Adjusted Correction</div>
        <div class="cell equation">=</div>
        <div class="cell is-equals">{correctionBolusRec}u</div>
      </div>
    </div>
    <div class="row has-space">
      <TextField className="oversized" hasButtons={true} minValue={0} maxValue={50} stepIncrements={1} label="Carbs" suffix="g" width="100%" labelWidth="110px" bind:value={carbs} />
    </div>
    <div class="row has-space">
      <TextField className="oversized" hasButtons={true} minValue={0.0} maxValue={props.maxBolus} stepIncrements={0.05} label="Total Bolus" suffix="units" width="100%" labelWidth="110px" bind:value={bolusAmount} />
    </div>
    {#if maxBolusWarning}
      <div class="row"><span class="warning">This bolus is higher than your Max Bolus setting.</span></div>
    {/if}
  </div>
  <DidYouKnow coach="educator">{tip}</DidYouKnow>
  <Actions align="center">
    <Button onClick={cancelFn}>Cancel</Button>
    <Button active={maxBolusWarning !== true} className="wide primary" onClick={submitFn}>Bolus</Button>
  </Actions>
</div>

<style>

  .mock-correction-form {
    display: grid;
    grid-gap: 12px;
  }

  h3 {
    font-size: 18px;
    margin: 2px 0 6px;
    text-align: center;
  }

  .row.has-space {
    margin-bottom: 6px;
  }

  .calculations {
    margin-bottom: 18px;
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

  .calc-row .cell.is-equals {
    border-top: 1px solid var(--border-color-dull);
    color: var(--text-color);
    font-weight: var(--bold-weight);
  }

  .warning {
    color: red;
    font-size: 13px;
    text-align: center;
  }

</style>
