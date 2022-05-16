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
    margin-left: 50px;
    text-align: left;
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
  import { slide } from "svelte/transition";
  import { sineInOut } from "svelte/easing";
  import NotesPage from "./pages/NotesPage.svelte";
  import WordInputPage from "./pages/WordInputPage.svelte";
  let currentTab: string = "Add";

  const tabs = [
      { name: "Notes", component: NotesPage },
      { name: "Add", component: WordInputPage },
      { name: "Test", component: NotesPage },
      { name: "Statistics", component: NotesPage }
  ];

</script>

<main>
  <h1>Ying</h1>
  <div class="container">
    <div class="leftColumn">
      {#each tabs as tab}
        <MenuTab bind:currentTab text={tab.name}/>
      {/each}
    </div>
    <div class="rightColumn">
      {#each tabs as tab}
        {#if currentTab === tab.name}
          <div in:slide={{duration: 300, delay: 350, easing: sineInOut}} out:slide={{duration: 300}}>
            <svelte:component this={tab.component}/>
          </div>
        {/if}
      {/each}
    </div>
  </div>
</main>
