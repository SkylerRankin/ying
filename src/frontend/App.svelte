<style>
  .container {
    padding: 1em;
    max-width: 600px;
    margin: 0 auto;
  }

  .heading {
    text-align: center;
    margin: 50px 0;
  }

  h1 {
    color: #609b58;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
    margin-bottom: 0;
  }

</style>

<script lang="ts">
  import PredictiveInput from './components/PredictiveInput.svelte';
</script>

<main>
  <div class="container">
    <div class="heading">
      <h1>ying</h1>
      <small>A Chinese note taking and study tool.</small>
    </div>
    <PredictiveInput/>
  </div>
</main>
