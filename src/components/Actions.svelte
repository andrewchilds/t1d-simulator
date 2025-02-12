<script>

  export let align = 'right';
  export let margin = false;

</script>

<div class="actions {align} {margin ? 'has-margin' : ''}"><slot></slot></div>

<style>

  .actions {
    display: grid;
    grid-gap: 10px;
    grid-auto-flow: column;
  }

  .actions.has-margin {
    margin: 16px 0;
  }

  .actions.left {
    justify-content: start;
  }

  .actions.right {
    justify-content: end;
  }

  .actions.center {
    justify-content: center;
  }

</style>
