<script lang="ts">
    import AsciiGraph from "../components/AsciiGraph.svelte";
    import type { ElectronAPI } from "../../common/constants";
    const electronAPI: ElectronAPI = (window as any).electronAPI;

</script>

<style>
    .metadataContainer { color: var(--main-color-gray); font-size: 12px; }
</style>

<div>
    <AsciiGraph title="Frequency by Phase at 10m radius"/>
    <hr/>
    <div class="metadataContainer">
        {#await electronAPI.getAppMetadata()}
        <p>loading...</p>
        {:then appMetadata}
        <p>isProd: {appMetadata.isProd}</p>
        <p>notesDatabasePath: {appMetadata.notesDatabasePath}</p>
        {/await}
    </div>
</div>