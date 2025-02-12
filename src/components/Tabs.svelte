<script>

  export let tabs;
  export let activeTab;

  function onClick(tab) {
    activeTab = tab.id;
  }

</script>

<div class="tabs">
  {#each tabs as tab (tab.id)}
    <button on:click={() => onClick(tab)} class="{tab.id === activeTab ? 'active' : ''}">{tab.name}</button>
  {/each}
</div>

<style>

  .tabs {
    border-bottom: 1px solid var(--border-color);
    display: grid;
    justify-content: start;
    grid-auto-flow: column;
    margin: 14px 0;
  }

  button {
    background: transparent;
    border: 0;
    color: var(--text-color-dull);
    font-weight: var(--regular-weight);
    padding: 8px 16px;
    margin: 0;
  }

  button.active {
    border-bottom: 2px solid var(--border-color-bright);
    color: var(--text-color-bright);
    font-weight: var(--bold-weight);
    position: relative;
    top: 1px;
  }

</style>
