<script>

  import LoadingSpinner from '../icons/LoadingSpinner.svelte';

  export let href;
  export let isSaving = false;
  export let className = 'standard';
  export let onClick;
  export let target;
  export let type = 'button';
  export let active = true;

</script>

{#if active}
  {#if isSaving}
    <div class="button is-saving">
      <span class="spinner"><LoadingSpinner size={24} /></span>
      <span class="hide"><slot></slot></span>
    </div>
  {:else if href && target}
    <a {href} {target} class="button {className}"><slot></slot></a>
  {:else}
    <button {type} class="button {className}" on:click|preventDefault={onClick}><slot></slot></button>
  {/if}
{:else}
  <div class="button disabled {className}"><slot></slot></div>
{/if}

<style>

  .button {
    background: var(--button-bg-color);
    border-radius: 4px;
    border: 0;
    color: var(--text-color);
    cursor: pointer;
    display: inline-grid;
    padding: 10px 16px;
    font-size: 15px;
    font-weight: var(--bold-weight);
    line-height: 20px;
    outline: none;
    text-decoration: none;
    transition: transform 100ms ease, background-color 180ms ease;
    width: fit-content;
    grid-gap: 4px;
    grid-auto-flow: column;
    align-items: center;
    user-select: none;
  }

  .button :global(svg) {
    stroke: var(--text-color);
  }

  .button.has-add-on {
    border-radius: 4px 0 0 4px;
  }

  .button.add-on {
    border-radius: 0 4px 4px 0;
    margin-left: -9px;
    padding: 10px 11px;
  }

  .button.delete {
    background: none;
    opacity: 0.5;
  }

  .button.small {
    padding: 5px 12px 6px;
    font-size: 14px;
  }

  .button.delete.faded {
    opacity: 0.3;
  }

  .button.input-like {
    background: var(--button-input-like-bg-color);
    padding: 5px 0 6px;
    font-size: 12px;
    width: 32px;
  }

  .button.border-only {
    background: none;
    border: 1px solid var(--border-color-dull);
    padding-top: 9px;
    padding-bottom: 9px;
  }

  .button.primary {
    background: var(--button-primary-bg-color);
    color: var(--button-primary-text-color);
  }

  .button.alert {
    background: var(--button-alert-bg-color);
    color: var(--button-alert-text-color);
  }

  .button.no-background {
    background: none;
    box-shadow: none;
  }

  .button.disabled {
    background: var(--button-bg-color) !important;
    box-shadow: 0 0 0 1px var(--border-color-dull) inset !important;
    color: var(--button-text-color);
    opacity: 0.4;
    cursor: inherit;
    pointer-events: none;
  }

  .button.wide {
    padding-left: 30px;
    padding-right: 30px;
  }

  .is-saving {
    opacity: 0.8;
    cursor: inherit;
    position: relative;
    pointer-events: none;
  }

  .spinner {
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
    text-align: center;
    display: grid;
    align-content: center;
    justify-content: center;
  }

  .button .spinner :global(svg) {
    stroke: none;
  }

  .hide {
    opacity: 0;
  }

  .button:hover, .button:focus {
    background: var(--button-bg-color-hover);
    box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.2) inset;
  }

  .button:active {
    background: var(--button-bg-color-active);
    box-shadow: none;
    color: var(--button-text-color-active);
    text-decoration: none;
    transform: scale(0.97);
  }

  .button.primary:hover, .button.primary:focus {
    background: var(--button-primary-bg-color-hover);
  }

  .button.primary:active {
    background: var(--button-primary-bg-color-active);
    color: var(--button-primary-text-color-active);
  }

  .button.alert:hover, .button.alert:focus {
    background: var(--button-alert-bg-color-hover);
  }

  .button.alert:active {
    background: var(--button-alert-bg-color-active);
    color: var(--button-alert-text-color-active);
  }

  .button :global(.icon-square) {
    margin-right: 2px;
    opacity: 0.5;
  }

  .button :global(.icon-check-square) {
    margin-right: 2px;
    stroke: var(--link-color);
  }

  .button :global(.icon-chevron-down) {
    opacity: 0.5;
  }

  .button.primary :global(.icon-chevron-down) {
    stroke: var(--button-primary-text-color);
    fill: var(--button-primary-text-color);
    opacity: 1;
  }

</style>
