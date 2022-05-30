<style>
    .separator { color: var(--main-color-gray); }
    .title { color: var(--main-color-gray); }
    .item { color: var(--main-color-gray); cursor: pointer; margin-right: 20px; }
    .item:hover { text-decoration: underline; }
    .itemSelected { color: var(--main-color-blue); }

    hr {
        border-top: 1px dashed var(--main-color-gray);
        margin: 20px 0px;
    }
</style>
  
<script lang="ts">
    const tabs = [ "notes", "test", "stats", "add" ];
    export let currentTab = tabs[0];

    const onTabSelect = (tabName: string) => {
        currentTab = tabName;
    }

</script>
  
<div>
    <span class="title">ying</span>
    <span class="separator"> | </span>
    {#each tabs as tab}
    <span class={`item ${currentTab === tab ? "itemSelected" : ""}`} on:click="{() => onTabSelect(tab)}">{tab}</span>
    {/each}
    <hr/>
</div>