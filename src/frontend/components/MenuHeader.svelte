<style>
    .headerContainer { position: relative; }
    .separator { color: var(--main-color-gray); }
    .title { color: var(--main-color-gray); }
    .item { color: var(--main-color-gray); cursor: pointer; margin-right: 20px; }
    .item:hover { text-decoration: underline; }
    .itemSelected { color: var(--main-color-blue); }
    .settingsItem { position: absolute; right: 0; margin-right: 0px; }

    hr {
        border-top: 1px dashed var(--main-color-gray);
        margin: 20px 0px;
    }
</style>
  
<script lang="ts">
    const tabs = [ "notes", "test", "stats", "add", "settings"];
    const extraClasses = ["", "", "", "", "settingsItem"];
    export let currentTab = tabs[4];

    const onTabSelect = (tabName: string) => {
        currentTab = tabName;
    }

</script>
  
<div class="headerContainer">
    <span class="title">ying</span>
    <span class="separator"> | </span>
    {#each tabs as tab, i}
    <span class={`item ${currentTab === tab ? "itemSelected" : ""} ${extraClasses[i]}`} on:click="{() => onTabSelect(tab)}">{tab}</span>
    {/each}
    <hr/>
</div>