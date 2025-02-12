<script>

  export let coach = 'educator';

  let team = {
    nutritionist: '🧑🏼‍⚕️',
    endo: '👨🏿‍⚕️',
    educator: '👩🏻‍💼',
  };

</script>

<div class="did-you-know">
  <div class="quote">
    <slot></slot>
    <div class="talk-pointer">
      <svg width="27" height="18" viewBox="0 0 27 18" fill="currentColor" stroke="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.46582 16.817C7.00644 13.5468 13.8374 9.86158 16.5675 0.978149L26.9132 11.8371C20.8766 17.75 13.1255 18.8763 0.46582 16.817Z" />
      </svg>
    </div>
  </div>
  <div class="coach">{team[coach]}</div>
</div>

<style>

  .did-you-know {
    margin: 12px 0 12px -4px;
    position: relative;
  }

  .quote {
    background: var(--did-you-know-bg);
    border-radius: 30px;
    box-shadow: 0 1px 0 var(--drop-shadow);
    margin: 0 0 0 38px;
    padding: 24px 28px;
    font-size: 15px;
    line-height: 140%;
    text-align: left;
    position: relative;
  }

  .talk-pointer svg {
    bottom: 3px;
    color: var(--did-you-know-bg);
    height: 15px;
    left: -4px;
    position: absolute;
    width: 23px;
  }

  .coach {
    bottom: 0;
    font-size: 34px;
    left: 0;
    line-height: 34px;
    position: absolute;
  }

</style>
