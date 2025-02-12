<script>

  export let food;
  export let selectedFood = {};
  export let clickable = true;

  function selectFood() {
    if (clickable) {
      selectedFood = food;
    }
  }

</script>

<button class="food-option {food.id === selectedFood.id ? 'selected': ''} {clickable ? '' : 'unclickable'}" on:click={selectFood}>
  <div class="food-emoji" style="background: {food.color}">{food.emoji}</div>
  <div class="food-info">
    <div class="food-name">{food.name}</div>
    <div class="food-macros">
      <div class="food-macro">{food.carbs} <span class="macro-type">Carbs</span></div>
      <div class="food-macro">{food.fat} <span class="macro-type">Fat</span></div>
      <div class="food-macro">{food.protein} <span class="macro-type">Protein</span></div>
    </div>
  </div>
</button>

<style>

  .food-option {
    cursor: pointer;
    background: var(--card-dull-bg-color);
    border-radius: 4px;
    box-shadow: 0 1px 2px var(--drop-shadow);
    color: var(--text-color);
    font-weight: var(--bold-weight);
    padding: 6px;
    position: relative;
    display: grid;
    grid-template-columns: 50px 1fr;
    grid-gap: 8px;
    align-items: stretch;
    text-align: left;
    outline: none;
    width: 100%;
  }

  .food-option.unclickable {
    cursor: default;
  }

  .food-option.selected {
    background: var(--card-bg-color);
    box-shadow: 0 0 1px 2px var(--input-border-focus);
  }

  .food-emoji {
    font-size: 28px;
    border-radius: 2px;
    background: #ccc;
    display: grid;
    justify-items: center;
    align-items: center;
  }

  .food-name {
    margin: 4px 0 0 0;
    font-size: 16px;
    line-height: 140%;
  }

  .food-macros {
    font-size: 15px;
    line-height: 140%;
    font-weight: var(--bold-weight);
    margin: 4px 0 6px;
    color: var(--text-color);
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .macro-type {
    font-size: 13px;
    font-weight: var(--regular-weight);
  }

</style>
