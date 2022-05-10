<script lang="ts">
    import type { ElectronAPI } from "../../common/constants";
    const electronAPI: ElectronAPI = (window as any).electronAPI;

    let search: string = '';
    let result: string = 'none';

    // This code block is 'reactive' in that it runs every time the depdenent variables (search) change.
    // Update the predictions whenever the search text changes.
    $: (async () => {
        result = 'loading...';
        const response = await electronAPI.getSearchPredictions(search);
        result = response.map(item => `${item.pinyinSearchable} - ${item.simplified}`).join(", ");
    })();
</script>

<style>
    input {
        width: 100%;
        margin-bottom: 0;
    }

    .predictions {
        border: solid 1px gray;
        border-radius: 0px 0px 10px 10px;
    }

    .predictions div {
        padding: 0px 10px;
    }

    .predictions div:hover {
        background-color: bisque;
        cursor: pointer;
    }
</style>

<input bind:value="{search}"/>
<div class="predictions">
    <div>prediction 1</div>
    <div>prediction 2</div>
    <div>prediction 3</div>
</div>
<p>Search: {search}</p>
<p>Result: {result}</p>
<img src="images/image.png" width="600" alt="some code"/>
