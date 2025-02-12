<script>

  import { pluralize } from '../utils/str.js';

  import Advocacy from './Advocacy.svelte';

  export let props;

</script>

<div class="game-over">
  <h2>You made it {pluralize(props.dayNumber, 'day', 'days')}.</h2>

  <Advocacy />
</div>
