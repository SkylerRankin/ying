<style>
  .container {
    padding: 20px;
    max-width: 1000px;
    margin: 0px auto;
  }
</style>

<script lang="ts">
  import WordInputPage from "./pages/WordInputPage.svelte";
  import MenuHeader from "./components/MenuHeader.svelte";
  import NotesPage from "./pages/NotesPage.svelte";
  import StatsPage from "./pages/StatsPage.svelte";
import TestPage from "./pages/TestPage.svelte";
  let currentTab: string;
</script>

<main>
  <div class="container">
    <MenuHeader bind:currentTab/>
    {#if currentTab === "add"}
      <WordInputPage />
    {:else if currentTab === "notes"}
      <NotesPage />
    {:else if currentTab === "stats"}
      <StatsPage />
    {:else if currentTab === "test"}
      <TestPage />
    {/if}
  </div>
</main>
