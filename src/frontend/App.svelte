<style>
  .container {
    display: flex;
    flex-direction: row;
    padding: 20px;
    height: calc(100vh - 40px);
  }

  h1 {
    color: #609b58;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
    margin: 0;
    text-align: center;
  }

  .leftColumn {
    width: 200px;
    height: 100%;
  }

  .rightColumn {
    flex: 1 1 auto;
    height: 100%;
    padding: 0 20px;
  }

  hr {
    margin: 30px 0;
    border-top: 1px solid #bbbbbd;
  }

</style>

<script lang="ts">
  import MenuTab from "./components/MenuTab.svelte";
  import { fade } from "svelte/transition";
  let currentTab: string = "Notes";
</script>

<main>
  <div class="container">
    <div class="leftColumn">
      <h1>ying</h1>
      <small>A Chinese note taking and study tool.</small>
      <hr/>
      <MenuTab bind:currentTab text="Notes"/>
      <MenuTab bind:currentTab text="Test"/>
      <MenuTab bind:currentTab text="Statistics"/>
    </div>
    <div class="rightColumn">
      {#if currentTab === "Notes"}
        <div transition:fade={{duration: 300}}>
          <div>Notes</div>
        </div>
      {:else if currentTab === "Test"}
        <div transition:fade={{duration: 300}}>test</div>
      {:else if currentTab === "Statistics"}
        <div transition:fade={{duration: 300}}>stats</div>
      {/if}
    </div>
  </div>
</main>
