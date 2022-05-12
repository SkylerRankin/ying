<script lang="ts">
    export let text: string;
    export let currentTab: string;

    $: selected = currentTab === text;

    const handleClick = () => {
        currentTab = text;
    }

</script>

<style>
    .root {
        padding: 20px;
        width: calc(100% - 40px);
        margin: 10px 0px;
        vertical-align: middle;
        cursor: pointer;
        border-radius: 5px;
    }

    .root.selected {
        background-color: #ecfff8;
    }

    img {
        margin-right: 10px;
        height: 20px;
    }

    p {
        margin: 0;
        display: inline;
        font-weight: bold;
        color: #bbbbbd;
    }

    p.selected {
        color: #39423f;
    }

</style>

<div class="{`root ${selected ? "selected" : ""}`}" on:click={handleClick}>
    <img src="images/notepad.png" alt="notepad"/>
    <p class="{selected ? "selected" : ""}">{text}</p>
</div>