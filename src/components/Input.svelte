<script>

  export let type = 'text';
  export let id;
  export let name;
  export let value;
  export let placeholder;
  export let className;
  export let autocomplete = 'off';
  export let pattern; // for numeric-only inputs
  export let inputmode; // for numeric-only inputs
  export let maxlength;
  export let readonly;

  export let selectOnFocus;
  export let emptyOnZeroFocus;

  export let suffix;
  export let width = '200px';

  function setType(node) {
    node.type = type;
  }

  function onFocus(e) {
    if (emptyOnZeroFocus && e.target.value === '0') {
      e.target.value = '';
    } else if (selectOnFocus) {
      e.target.select();
    }
  }

</script>

<div class="input {suffix ? 'has-suffix' : ''}" style="width: {width};">
  <input class={className} {autocomplete} {readonly} use:setType {id} {pattern} {name} {placeholder} {inputmode} {maxlength} bind:value on:change on:blur on:input on:focus={onFocus} on:paste on:keyup on:keydown />
  {#if suffix}
    <span class="suffix {(className + '').includes('oversized') ? 'oversized' : ''}">{suffix}</span>
  {/if}
</div>

<style>

  .input {
    position: relative;
  }

  input {
    background: var(--input-bg-color);
    border: 1px solid var(--input-border-color);
    border-radius: 5px;
    color: var(--text-color);
    font-size: 18px;
    padding: 8px 10px;
    outline: none;
    box-sizing: border-box;
    width: 100%;
    appearance: none;
    /* Used to allow full-width datetime input */
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  input.faded {
    color: var(--text-color-dull);
    font-weight: var(--regular-weight);
  }

  input.oversized {
    font-size: 22px;
    padding: 10px 12px;
  }

  input.small {
    font-size: 16px;
    padding: 6px 8px;
  }

  input.secret-code {
    font-size: 60px;
    padding: 10px 12px;
    text-align: center;
    width: 100%;
  }

  input:hover {
    border: 1px solid var(--input-border-hover);
  }

  input:active, input:focus {
    background: var(--input-bg-color-focus);
    box-shadow: 0 0 1px 1px var(--input-border-focus);
    border: 1px solid var(--input-border-focus);
    outline: none;
  }

  input[readonly] {
    background: transparent;
    border: 1px solid transparent;
  }

  .suffix {
    color: var(--text-color-dull);
    pointer-events: none;
    position: absolute;
    right: 10px;
    top: 10px;
  }

  .suffix.oversized {
    right: 12px;
    top: 16px;
  }

</style>
