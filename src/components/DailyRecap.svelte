<script>

  import { pluralize } from '../utils/str.js';

  export let props;

</script>

<div class="stat-group" >
  <div class="stat">
    <span class="stat-name">Time in Range</span>
    {#if props.noCGM}
      ?
    {:else}
      {Math.round(props.stats.percentages.inRange)}%
      {#if props.stats.percentages.inRange >= 70}
        <div class="stat-badge">🏅</div>
      {/if}
    {/if}
  </div>
  <div class="stat">
    <span class="stat-name">Average BG</span>
    {#if props.noCGM}
      ?
    {:else}
      {props.convertToUnit(props.stats.avg)} {props.printUnit()}
      {#if props.stats.avg <= 150}
        <div class="stat-badge">🏅</div>
      {/if}
    {/if}
  </div>
  <div class="stat">
    <span class="stat-name">Estimated A1C</span>
    {#if props.noCGM}
      ?
    {:else}
      {props.stats.a1c}
      {#if props.stats.a1c <= 7}
        <div class="stat-badge">🏅</div>
      {/if}
    {/if}
  </div>
  <div class="stat">
    <span class="stat-name">Water</span>
    {pluralize(props.dailyCounts.waterCount, 'glass', 'glasses')}
    {#if props.dailyCounts.waterCount > 2}
      <div class="stat-badge">🏅</div>
    {:else if props.dailyCounts.waterCount === 0}
      <div class="stat-badge">⛔️</div>
    {/if}
  </div>
  <div class="stat">
    <span class="stat-name">Exercise</span>
    {props.dailyCounts.exerciseCount > 0 ? 'Yes' : 'No'}
    {#if props.dailyCounts.exerciseCount > 0}
      <div class="stat-badge">🏅</div>
    {:else}
      <div class="stat-badge">⛔️</div>
    {/if}
  </div>
  <div class="stat">
    <span class="stat-name">Sleep</span>
    {props.dailyCounts.sleepInterruptions > 0 ? 'Poor' : 'OK'}
    {#if props.dailyCounts.sleepInterruptions === 0}
      <div class="stat-badge">🏅</div>
    {/if}
  </div>
</div>
<!--
  <div class="stat-group">
    <div class="stat"><span class="stat-name">Bolus Insulin:</span> {props.dailyCounts.bolusInsulin} units</div>
    <div class="stat"><span class="stat-name">Carbs Eaten:</span> {props.dailyCounts.carbsEaten} grams</div>
  </div>
-->

<style>

  .stat-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 20px;
    margin: 20px 0;
  }

  .stat-group .stat {
    background: var(--card-bg-color);
    border-radius: 4px;
    box-shadow: 0 1px 2px var(--drop-shadow);
    font-size: 24px;
    line-height: 140%;
    font-weight: var(--bold-weight);
    padding: 12px 18px 10px;
    position: relative;
  }

  .stat .stat-name {
    font-size: 14px;
    font-weight: var(--regular-weight);
    color: var(--text-color-dull);
    line-height: 100%;
    display: block;
    margin: 0;
  }

  .stat-badge {
    position: absolute;
    top: -6px;
    right: 4px;
  }

</style>
