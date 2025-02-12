<script>

  // import TextField from './TextField.svelte';

  import Check from '../icons/Check.svelte';

  export let props;

  let onChange = props.onChange;

  let values = {
    noCGM: props.noCGM,
    pumpType: props.pumpType,
    mmol: props.mmol,
  };

  let optionSets = [
    {
      name: 'CGMs',
      options: [
        {
          key: 'noCGM',
          value: false,
          name: 'CGM',
          note: 'Most Continuous Glucose Monitors provide readings every 5 minutes.'
        },
        {
          key: 'noCGM',
          value: true,
          name: 'No CGM',
          note: `Many people with T1D use a glucometer alone to check their blood sugar.`
        }
      ]
    },
    {
      name: 'Insulin Delivery',
      options: [
        {
          key: 'pumpType',
          disabled: true,
          value: 'loop',
          name: 'Closed-Loop Insulin Pump',
          note: 'Basal rates are automated (coming soon)',
        },
        {
          key: 'pumpType',
          value: 'manual',
          name: 'Basic Insulin Pump',
          note: 'Basal rates are programmed manually'
        },
        {
          key: 'pumpType',
          disabled: true,
          value: 'none',
          name: 'MDI',
          note: 'Multiple Daily Injections (coming soon)'
        }
      ]
    },
    {
      name: 'Measurement',
      options: [
        {
          key: 'mmol',
          value: false,
          name: 'mg/dL',
          note: 'The US uses mg/dL for blood glucose measurement.',
        },
        {
          key: 'mmol',
          value: true,
          name: 'mmol/L',
          note: 'Many countries outside the US use mmol/L for blood glucose measurement.',
        }
      ]
    }
  ];

  // $: {
  //   onChange('personWeight', personWeight);
  // }

</script>
<div class="game-settings">

  {#each optionSets as optionSet}
    <div class="row">
      <div class="label">{optionSet.name}</div>

      {#each optionSet.options as option}
        <button class="{option.disabled ? 'disabled' : ''} {values[option.key] === option.value ? 'selected' : ''}" on:click={() => { values[option.key] = option.value; onChange(option.key, option.value)}}><div class="radio"><div class="selected"><Check /></div><div class="unselected"></div></div>{option.name} <div class="note">{option.note}</div></button>
      {/each}
    </div>
  {/each}

  <!--
  <div class="row">
    <TextField hasButtons={true} minValue={10} maxValue={400} stepIncrements={5} label="Weight" suffix="lbs" labelWidth="120px" width="100%" bind:value={personWeight} />
  </div>
  -->

</div>

<style>

  .row {
    margin: 6px 0 0;
  }

  .label {
    font-weight: var(--bold-weight);
    margin: 20px 0 6px;
    font-size: 16px;
  }

  button {
    border-radius: 8px;
    background: var(--card-dull-bg-color);
    color: var(--text-color-bright);
    font-weight: var(--bold-weight);
    width: 100%;
    margin: 4px 0;
    padding: 12px 16px 12px 40px;
    text-align: left;
    border: 0;
    position: relative;
  }

  button.disabled {
    cursor: default;
    pointer-events: none;
    opacity: 0.35;
  }

  button.selected {
    background: var(--card-bg-color);
    box-shadow: 0 0 1px 2px var(--input-border-focus);
  }

  button .radio {
    left: 14px;
    position: absolute;
    top: 14px;
  }

  button .radio div {
    display: none;
  }

  button.selected .radio div.selected {
    display: block;
  }

  .note {
    color: var(--text-color-dull);
    font-size: 15px;
    font-weight: var(--regular-weight);
    line-height: 20px;
  }

</style>
