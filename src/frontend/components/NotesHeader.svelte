<script lang="ts">
    export let searchText: string;
    const onClearSearch = () => {
        searchText = "";
    }
</script>

<style>
    .container {
        display: flex;
        height: 30px;
        max-width: 1200px;
        margin: 0 auto;
    }

    .inline {
        display: inline-block;
    }

    .centeredText {
        display: inline-flex;
        align-items: center;
        justify-content: space-around;
    }

    .headerLabel {
        width: 40px;
        flex: none;
        height: 30px;
    }

    .addButton {
        width: 60px;
        flex: none;
        height: 30px;
        background-color: green;
        color: white;
        border-radius: 10px;
        border: none;
        cursor: pointer;
    }

    .filterRow {
        height: 30px;
        flex: none;
    }

    .filterItem {
        margin: 0;
        height: 100%;
        color: lightgray;
        cursor: pointer;
    }

    .filterItem:hover {
        text-decoration: underline;
    }

    input {
        width: 100%;
        height: 30px;
        border-radius: 30px;
        outline: none;
        padding-left: 20px;
    }

    .inputContainer {
        flex: 1 1 auto;
        height: 30px;
        margin: 0 20px;
        position: relative;
    }

    .inputContainer i {
        position: absolute;
        height: 30px;
        right: 20px;
        top: 3px;
        cursor: pointer;
        color: lightgray;
    }

</style>

<div class="container">
    <div class="inline headerLabel centeredText">Filter:</div>
    <div class="inline filterRow">
        <div class="filterItem centeredText">Word</div>
        <div class="filterItem centeredText">Sentence</div>
        <div class="filterItem centeredText">Grammar</div>
    </div>
        <div class="inputContainer">
            <i on:click="{onClearSearch}">CLEAR</i>
            <input bind:value="{searchText}"/>
        </div>
    
    <button class="inline addButton centeredText">Add</button>
</div>
