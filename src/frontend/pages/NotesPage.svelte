<script lang="ts">
    import type { Note } from "../../common/constants";
    import { notesStore } from "../stores";
    import type { ElectronAPI } from "../../common/constants";
    const electronAPI: ElectronAPI = (window as any).electronAPI;

    let searchText: string;
    let notes: Note[];
    let filteredNotes: Note[];
    let selectedNote: Note | undefined;

    notesStore.subscribe(value => notes = value);

    $: (async () => {
        if (!searchText || searchText.length === 0) {
            filteredNotes = notes;
        } else {
            const response = await electronAPI.getNotesSearchPredictions(searchText);
            const matchingNotes = [...response.englishResults, ...response.pinyinResults];
            filteredNotes = matchingNotes;
        }
    })()
</script>

<style>
    input {
        background: none;
        border: none;
        outline: none;
        font-size: 16px;
    }

    .searchBar {
        margin-bottom: 30px;
    }

    .editPanel {
        margin-bottom: 30px;
    }

    .noteItemRow {
        font-size: 0px;
        cursor: pointer;
    }

    .noteItemRow:hover {
        border-bottom: 1px dashed var(--main-color-gray);
    }

    .noteItem {
        vertical-align: top;
        display: inline-block;
        width: 25%;
        font-size: 16px;
    }

    .dateItem { color: var(--main-color-gray); }
</style>

<div>
    <div class="searchBar">
        <input bind:value="{searchText}" placeholder="search..."/>
    </div>
    {#if selectedNote}
    <div class="editPanel">
        <button on:click="{() => selectedNote = undefined}">Edit</button>
        <button on:click="{() => selectedNote = undefined}">Delete</button>
        <button on:click="{() => selectedNote = undefined}">Cancel</button>
    </div>
    {/if}
    {#each filteredNotes as note}
        <div class="noteItemRow" on:click="{() => selectedNote = note}">
            <span class="noteItem">{note.simplified}</span>
            <span class="noteItem">{JSON.parse(note.pinyin)}</span>
            <span class="noteItem">{JSON.parse(note.english)}</span>
            <span class="noteItem dateItem">{new Date(note.timeCreated).toLocaleDateString()}</span>
        </div>
    {:else}
        <small>No notes.</small>
    {/each}
</div>