<script>

  import { createRange } from '../utils/array.js';
  import { scaleLinear } from '../utils/chart.js';

  export let value = 0;
  export let scaleFn = defaultScaleFn;

  export let min;
  export let max;
  export let step = 1;
  export let ticks = 5;

  export let onChange;
  export let onInput;

  export let decreaseFn = onDecrease;
  export let decreaseText = '-1hr';
  export let increaseFn = onIncrease;
  export let increaseText = '+1hr';

  function defaultScaleFn(v) {
    return scaleLinear(v, [min, max], [0, 100]);
  }

  function onDecrease() {
    value = Math.max(min, value - step);
  }

  function onIncrease() {
    value = Math.min(max, value + step);
  }

</script>

<div class="slider">
  <div class="pseudo-slider">
    <div class="track">
      <div class="handle" style="left: {scaleFn(value)}%;"></div>
    </div>
  </div>
  <div class="decrease" on:click={decreaseFn}>{decreaseText}</div>
  <div class="increase" on:click={increaseFn}>{increaseText}</div>
  <div class="ticks">
    {#each createRange(1, ticks) as tick}
      <div class="tick"></div>
    {/each}
  </div>
  <input class="real-slider" type="range" {min} {max} {step} bind:value={value} on:change={onChange} on:input={onInput} />
</div>

<style>

  .slider {
    position: relative;
    margin: -10px 56px 0;
    height: 40px;
    width: auto;
  }

  .decrease, .increase {
    cursor: pointer;
    position: absolute;
    height: 40px;
    line-height: 40px;
    width: 50px;
    top: 4px;
    font-size: 15px;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    text-align: center;
  }

  .decrease {
    left: -50px;
  }

  .increase {
    right: -50px;
  }

  .ticks {
    pointer-events: none;
    position: absolute;
    left: 0;
    top: 34px;
    display: grid;
    grid-auto-flow: column;
    width: 100%;
    height: 5px;
    padding: 0 10px;
    box-sizing: border-box;
    justify-items: center;
    justify-content: space-between;
  }

  .ticks .tick {
    width: 1px;
    height: 100%;
    background: var(--border-color);
  }

  .pseudo-slider {
    background: hsla(var(--green-hue), 70%, 40%, 0.4);
    border-radius: 12px;
    cursor: pointer;
    height: 14px;
    pointer-events: none;
    position: absolute;
    top: 16px;
    width: 100%;
  }

  .pseudo-slider .track {
    position: absolute;
    left: 11px;
    width: calc(100% - 22px);
    height: 14px;
  }

  .pseudo-slider .handle {
    background: var(--button-primary-bg-color);
    box-shadow: 1px 1px 0 rgba(255, 255, 255, 0.1) inset;
    width: 20px;
    height: 20px;
    border-radius: 2px;
    position: absolute;
    left: 0;
    top: -3px;
    margin-left: -10px;
    transition: left 80ms ease-out;
  }

  .pseudo-slider .handle:hover {
    background: var(--button-primary-bg-color-hover);
  }

  .real-slider {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    cursor: pointer;
    height: 40px;
  }

</style>
