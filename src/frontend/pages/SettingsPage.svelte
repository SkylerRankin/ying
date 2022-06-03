<script lang="ts">
    import type { AppMetadata, ConfigData, ElectronAPI } from "../../common/constants";
    import { configDataStore } from "../stores";
    const electronAPI: ElectronAPI = (window as any).electronAPI;

    let configData: ConfigData;
    configDataStore.subscribe(data => configData = data);

    let appMetadata: AppMetadata;
    (async () => {
        appMetadata = await electronAPI.getAppMetadata();
    })();
    
    const onSetBackupDirectoryPath = async () => {
        const files = await electronAPI.openFileDialog("Select backup directory path", ["openDirectory"]);
        if (!files || files.length === 0) return;
        configDataStore.update(prevConfig => {
            prevConfig.backupDirectoryPath = files[0];
            return prevConfig;
        });
    }

</script>

<style>
    .sectionTitle {
        color: black;
    }
    .sectionContent {
        color: var(--main-color-gray);
        font-size: 12px;
        margin-bottom: 20px;
    }
    .button { cursor: pointer; }
    .button:hover { text-decoration: underline; }
</style>

<div>
    <div class="sectionTitle">config file</div>
    <div class="sectionContent">
        {#if configData}
            <div>backup directory path: {configData.backupDirectoryPath}</div>
            <div class="button" on:click="{onSetBackupDirectoryPath}">update</div>
        {:else}
            <div>loading config file</div>
        {/if}
    </div>

    <div class="sectionTitle">metadata</div>
    <div class="sectionContent">
        {#if appMetadata}
        <div>isProd: {appMetadata.isProd}</div>
        <div>notesDatabasePath: {appMetadata.notesDatabasePath}</div>
        {:else}
        <div>loading</div>
        {/if}
    </div>
</div>