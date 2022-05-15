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
    flex: none;
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
  import { blur } from "svelte/transition";
  import NotesPage from "./pages/NotesPage.svelte";
  import WordInputPage from "./pages/WordInputPage.svelte";
  let currentTab: string = "WordInput";
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
        <div in:blur={{duration: 300, delay: 300}} out:blur={{duration: 300}}>
          <NotesPage/>
        </div>
      {:else if currentTab === "Test"}
        <div in:blur={{duration: 300, delay: 300}} out:blur={{duration: 300}}>test</div>
      {:else if currentTab === "Statistics"}
        <div in:blur={{duration: 300, delay: 300}} out:blur={{duration: 300}}>stats</div>
      {:else if currentTab === "WordInput"}
        <div in:blur={{duration: 300, delay: 300}} out:blur={{duration: 300}}>
          <WordInputPage/>
        </div>
      {/if}
    </div>
  </div>
</main>
