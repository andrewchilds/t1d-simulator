<script>

  import { createUniqueId } from '../utils/dom.js';
  import { twoDecimals } from '../utils/numbers.js';

  import Input from './Input.svelte';
  import Slider from './Slider.svelte';
  import Button from './Button.svelte';

  export let id = createUniqueId();
  export let label;
  export let name = label ? label.toLowerCase() : '';
  export let value;
  export let pseudoInput;
  export let type = 'text';
  export let placeholder;
  export let suffix;
  export let autocomplete;
  export let labelWidth;
  export let className;
  export let maxlength;
  export let pattern; // for numeric-only inputs
  export let inputmode; // for numeric-only inputs
  export let width;
  export let selectOnFocus;
  export let emptyOnZeroFocus;
  export let labelPosition;
  export let editable = true;
  export let readonly = false;
  export let showInput = true;
  export let autocompleteItems = [];

  // Slider
  export let hasRange = false;
  export let minValue;
  export let maxValue;
  export let stepIncrements = 1;
  export let ticks = 7;

  export let decreaseFn;
  export let decreaseText = '-' + stepIncrements;
  export let increaseFn;
  export let increaseText = '+' + stepIncrements;

  // Buttons
  export let hasButtons = false;
  export let decreaseButtonFn = async () => {
    value = twoDecimals(Math.max(minValue, value - stepIncrements));
  };
  export let increaseButtonFn = async () => {
    value = twoDecimals(Math.min(maxValue, value + stepIncrements));
  };

  if (editable === false) {
    pseudoInput = value;
  }

  function compileAutocompleteItems(v) {
    if (!v) {
      return [];
    }

    return autocompleteItems.filter(item => {
      return item !== v && item.toLowerCase().indexOf(v.toLowerCase()) === 0;
    }).map(item => {
      return {
        value: item,
        match: item.substring(0, v.length),
        highlighted: item.substring(v.length)
      }
    });
  }

  let acItems;

  $: {
    acItems = compileAutocompleteItems(value);
  }

</script>

{#if showInput}
  <div class="textfield {label ? 'has-label' : ''}" style="{labelPosition === 'above' ? 'display: block;' : ''}{labelWidth ? `grid-template-columns: ${labelWidth} auto;` : ''}">
    {#if label}
      <label for={id}>{label}</label>
    {/if}
    {#if pseudoInput}
      <div class="pseudo-input">
        {pseudoInput}
      </div>
    {:else}
      <div class="input-button-parent {hasButtons ? 'has-buttons' : ''}">
        {#if hasButtons}
          <Button className="input-like" onClick={decreaseButtonFn}>-</Button>
          <Button className="input-like" onClick={increaseButtonFn}>+</Button>
        {/if}
        <div class="input-parent">
          <Input {width} {className} {id} {type} {name} {pattern} {inputmode} {placeholder} {autocomplete} {maxlength} {suffix} {selectOnFocus} {emptyOnZeroFocus} {readonly} bind:value on:keyup on:input on:keydown on:blur on:change on:paste />
          {#if acItems && acItems.length > 0}
            <div class="autocomplete-parent">
              <div class="autocomplete-items">
                {#each acItems as item, index}
                  <button on:click|preventDefault={() => { value = item.value; return false; }}>{item.match}<strong>{item.highlighted}</strong></button>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
    <slot name="footer"></slot>
  </div>
{/if}
{#if hasRange}
  <div class="slider-parent {label ? 'has-label' : ''}">
    <Slider min={minValue} max={maxValue} step={stepIncrements} {ticks} bind:value on:change on:input {decreaseFn} {decreaseText} {increaseFn} {increaseText} />
  </div>
{/if}

<style>

  .textfield {
    text-align: left;
  }

  .textfield.has-label {
    display: grid;
    justify-items: stretch;
    grid-template-columns: 70px auto;
    align-items: center;
  }

  .input-button-parent {
    display: block;
  }

  .input-button-parent.has-buttons {
    display: grid;
    grid-template-columns: 32px 32px 1fr;
    grid-gap: 1px;
  }

  .pseudo-input {
    background: var(--page-bg-color);
    border: none;
    border-radius: 5px;
    color: var(--text-color-dull);
    font-size: 18px;
    padding: 8px 10px;
  }

  label {
    color: var(--text-color-dull);
    font-size: 14px;
    line-height: 150%;
  }

  .slider-parent {
    top: -8px;
    position: relative;
  }

  .slider-parent.has-label {
    padding-left: 70px;
  }

  .autocomplete-parent {
    position: relative;
  }

  .autocomplete-items {
    background: var(--dropdown-bg-color);
    box-shadow: 0 2px 4px var(--drop-shadow-bright);
    position: absolute;
    top: 4px;
    left: 0;
    width: 200px;
    max-height: 166px;
    overflow-y: scroll;
    border-radius: 8px;
    box-sizing: border-box;
    z-index: var(--z-dropdowns);
    padding: 8px 0;
  }

  .autocomplete-items button {
    background: var(--dropdown-bg-color);
    display: block;
    color: var(--text-color);
    border: none;
    text-align: left;
    padding: 8px 16px;
    font-size: 18px;
    line-height: 18px;
    width: 100%;
    box-sizing: border-box;
  }

  .autocomplete-items button:hover, .autocomplete-items button:focus {
    background: var(--list-item-hover);
  }

</style>
