import App from './Simulator.svelte';

const div = document.querySelector('#app');

// Allow for Local Save as HTML!
div.innerHTML = '';

const app = new App({
  target: div,
});

export default app;
