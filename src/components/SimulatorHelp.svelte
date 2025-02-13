<script>

  import Advocacy from './Advocacy.svelte';
  import Tabs from './Tabs.svelte';

  let tabs = [
    { id: 'advocacy', name: 'Advocacy' },
    { id: 'about', name: 'About' },
    { id: 'sources', name: 'Sources' },
  ];

  let activeTab = 'advocacy';

</script>

<div class="simulator-help">

  <Tabs {tabs} bind:activeTab={activeTab} />

  <div class="page {activeTab !== 'advocacy' ? 'hidden' : ''}">
    <Advocacy />
  </div>

  <div class="page {activeTab !== 'about' ? 'hidden' : ''}">
    <p>This simulator was made to try to give people a rough sense of some of the challenges of living with Type 1 diabetes, and the types of decisions that need to be made multiple times every day, as well as create awareness about the importance of giving as many people access to the devices that can radically change their quality of life and long-term health outcomes.</p>
    <p>This was built by <a href="https://andrewchilds.com" target="_blank">Andrew Childs</a>, author of the T1D + food management app <a href="https://saltie.app" target="_blank">Saltie</a>. His son has food allergies and T1D. The source code is available on <a href="https://github.com/andrewchilds/t1d-simulator" target="_blank">GitHub</a>.</p>
    <p>If you have questions about management of Type 1, talk to a medical professional.</p>
    <p>If you have any questions, comments, or suggestions related to this simulation, <a href="mailto:andrew@subtractive.computer">please let Andrew know</a>.</p>
  </div>

  <div class="page {activeTab !== 'sources' ? 'hidden' : ''}">
    <p>Some of the information presented can be attributed to the following:</p>
    <h3>Macronutrients</h3>
    <ul>
      <li><a href="https://diabetesjournals.org/care/article/36/4/810/37916/Dietary-Fat-Acutely-Increases-Glucose" target="_blank">Dietary Fat Acutely Increases Glucose Concentrations</a></li>
      <li><a href="https://diabetesjournals.org/care/article/38/6/1008/37384/Impact-of-Fat-Protein-and-Glycemic-Index-on" target="_blank">Impact of Fat, Protein, and Glycemic Index on Postprandial Glucose Control</a></li>
    </ul>
    <h3>Hydration</h3>
    <ul>
      <li><a href="https://www.diabetes.co.uk/food/water-and-diabetes.html" target="_blank">Water and Diabetes</a></li>
    </ul>
    <h3>Activity</h3>
    <ul>
      <li><a href="https://pubmed.ncbi.nlm.nih.gov/35432757/" target="_blank">Health benefits outweigh the risks</a></li>
      <li><a href="https://www.diabetes.org.uk/guide-to-diabetes/managing-your-diabetes/exercise/walking-with-diabetes#benefits" target="_blank">Benefits Of Walking When You Have Diabetes</a></li>
    </ul>
    <h3>Sleep</h3>
    <ul>
      <li><a href="https://diabetesjournals.org/care/article/33/7/1573/39411/Partial-Sleep-Restriction-Decreases-Insulin" target="_blank">Partial Sleep Restriction Decreases Insulin Sensitivity in Type 1 Diabetes</a></li>
    </ul>
    <h3>Carb Sensitivity</h3>
    <ul>
      <li><a href="https://diatribe.org/treating-hypos-one-size-does-not-fit-all" target="_blank">Treating Hypos: One-Size Does Not Fit All</a></li>
    </ul>
    <h3>Glucotoxicity</h3>
    <ul>
      <li><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2738809/" target="_blank">Problems associated with glucose toxicity</a></li>
    </ul>
  </div>

</div>

<style>

  .page.hidden {
    display: none;
  }

  h3 {
    margin: 16px 0 0;
    font-size: 18px;
  }

  li {
    padding: 3px 2px;
    font-size: 15px;
  }

</style>
