<script>

  import { oneDecimal } from '../utils/numbers.js';

  import DidYouKnow from './DidYouKnow.svelte';
  import Tabs from './Tabs.svelte';
  import TextField from './TextField.svelte';

  export let props;

  let { targetBg, correctionFactor, maxBolus, carbRatios, basalProgram, onChange } = props;

  let activeTab = 'settings';

  let tabs = [
    { id: 'settings', name: 'Settings' },
    { id: 'carb-ratios', name: 'Carb Ratios' },
    { id: 'basal', name: 'Basal' },
  ];

  let tip1 = `If you have a question about your insulin pump settings, talk to your endocrinologist, diabetes educator, or physician.`;
  let tip2 = `Your Correction Factor is how much 1 unit of insulin is expected to lower your blood sugar in mg/dL.`;
  let tip3 = `Your Target Glucose is your desired blood sugar level. You'll get corrections added to your meal bolus whenever you're above this number.`;

  let carbRatioTip = `Carb ratios are grams of carbs to one unit of insulin, and can vary depending on time of day. Make small adjustments to see what works for you.`;

  let basalTip = `Basal insulin is background insulin delivered continually every day and night. Basal requirements can vary throughout the day and can change over time.`;

  let unitSpecificTargetBg = props.isMMOL() ? oneDecimal(targetBg / 18) : Math.round(targetBg);

  $: {
    if (props.isMMOL()) {
      targetBg = Math.round(unitSpecificTargetBg * 18);
    } else {
      targetBg = unitSpecificTargetBg;
    }
    onChange('targetBg', targetBg);
  }

  $: {
    onChange('correctionFactor', correctionFactor);
  }

  $: {
    onChange('maxBolus', maxBolus);
  }

  $: {
    onChange('basalProgram', basalProgram);
  }

  $: {
    onChange('carbRatios', carbRatios);
  }

</script>
<div class="pump-settings">

  <Tabs {tabs} bind:activeTab={activeTab} />

  <div class="page {activeTab !== 'settings' ? 'hidden' : ''}">
    <div class="row">
      <TextField hasButtons={true} minValue={props.isMMOL() ? 5 : 90} maxValue={props.isMMOL() ? 10 : 180} stepIncrements={props.isMMOL() ? 1 : 10} label="Target Glucose" suffix="{props.printUnit()}" labelWidth="140px" width="100%" bind:value={unitSpecificTargetBg} />
    </div>

    <div class="row">
      <TextField hasButtons={true} minValue={10} maxValue={500} stepIncrements={10} label="Correction Factor" labelWidth="140px" width="100%" bind:value={correctionFactor} />
    </div>

    <div class="row">
      <TextField hasButtons={true} minValue={5} maxValue={30} stepIncrements={1} label="Maximum Bolus" suffix="units" labelWidth="140px" width="100%" bind:value={maxBolus} />
    </div>

    <DidYouKnow coach="endo">{tip2}</DidYouKnow>
  </div>

  <div class="page {activeTab !== 'carb-ratios' ? 'hidden' : ''}">
    <div class="row">
      <TextField hasButtons={true} minValue={5} maxValue={50} stepIncrements={1} label="🌙 Midnight - 6am" labelWidth="140px" width="100%" bind:value={carbRatios[0].ratio} />
    </div>
    <div class="row">
      <TextField hasButtons={true} minValue={5} maxValue={50} stepIncrements={1} label="☀️ 6am - 10am" labelWidth="140px" width="100%" bind:value={carbRatios[1].ratio} />
    </div>
    <div class="row">
      <TextField hasButtons={true} minValue={5} maxValue={50} stepIncrements={1} label="☀️ 10am - 2pm" labelWidth="140px" width="100%" bind:value={carbRatios[2].ratio} />
    </div>
    <div class="row">
      <TextField hasButtons={true} minValue={5} maxValue={50} stepIncrements={1} label="☀️ 2pm - 8pm" labelWidth="140px" width="100%" bind:value={carbRatios[3].ratio} />
    </div>
    <div class="row">
      <TextField hasButtons={true} minValue={5} maxValue={50} stepIncrements={1} label="🌙 8pm - Midnight" labelWidth="140px" width="100%" bind:value={carbRatios[4].ratio} />
    </div>

    <DidYouKnow coach="endo">{carbRatioTip}</DidYouKnow>
  </div>

  <div class="page {activeTab !== 'basal' ? 'hidden' : ''}">
    <div class="row">
      <TextField hasButtons={true} minValue={0} maxValue={3} stepIncrements={0.05} label="🌙 Midnight - 4am" suffix="u/hr" labelWidth="140px" width="100%" bind:value={basalProgram[0].rate} />
    </div>
    <div class="row">
      <TextField hasButtons={true} minValue={0} maxValue={3} stepIncrements={0.05} label="🌙 4am - 8am" suffix="u/hr" labelWidth="140px" width="100%" bind:value={basalProgram[1].rate} />
    </div>
    <div class="row">
      <TextField hasButtons={true} minValue={0} maxValue={3} stepIncrements={0.05} label="☀️ 8am - 12pm" suffix="u/hr" labelWidth="140px" width="100%" bind:value={basalProgram[2].rate} />
    </div>
    <div class="row">
      <TextField hasButtons={true} minValue={0} maxValue={3} stepIncrements={0.05} label="☀️ 12pm - 4pm" suffix="u/hr" labelWidth="140px" width="100%" bind:value={basalProgram[3].rate} />
    </div>
    <div class="row">
      <TextField hasButtons={true} minValue={0} maxValue={3} stepIncrements={0.05} label="☀️ 4pm - 8pm" suffix="u/hr" labelWidth="140px" width="100%" bind:value={basalProgram[4].rate} />
    </div>
    <div class="row">
      <TextField hasButtons={true} minValue={0} maxValue={3} stepIncrements={0.05} label="🌙 8pm - Midnight" suffix="u/hr" labelWidth="140px" width="100%" bind:value={basalProgram[5].rate} />
    </div>

    <DidYouKnow coach="endo">{basalTip}</DidYouKnow>
  </div>

</div>

<style>

  .page.hidden {
    display: none;
  }

  .row {
    margin: 6px 0 0;
  }

</style>
