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
  import SettingsPage from "./pages/SettingsPage.svelte";
  let currentTab: string;

  const updateTab = (newTab: string): void => { currentTab = newTab };

</script>

<main>
  <div class="container">
    <MenuHeader bind:currentTab/>
    {#if currentTab === "add"}
      <WordInputPage />
    {:else if currentTab === "notes"}
      <NotesPage updateTab={updateTab} />
    {:else if currentTab === "stats"}
      <StatsPage />
    {:else if currentTab === "test"}
      <TestPage />
    {:else if currentTab === "settings"}
      <SettingsPage />
    {/if}
  </div>
</main>
