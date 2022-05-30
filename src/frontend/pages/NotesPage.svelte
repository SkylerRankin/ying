<script lang="ts">
    import type { Note } from "../../common/constants";
    import { editedNoteStore, notesStore } from "../stores";
    import type { ElectronAPI } from "../../common/constants";
    const electronAPI: ElectronAPI = (window as any).electronAPI;

    export let updateTab: (newTab: string) => void;

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
            filteredNotes = [];
            const addedIDs = new Set();
            [...response.englishResults, ...response.pinyinResults].forEach((note: Note) => {
                if (!addedIDs.has(note.id)) {
                    filteredNotes.push(note);
                    addedIDs.add(note.id);
                }
            });
        }
    })();

    const getScoreItemClass = (note: Note) => {
        if (note.totalWrongAnswers === 0 && note.totalCorrectAnswers === 0) return "";
        const percentage = note.totalCorrectAnswers / (note.totalWrongAnswers + note.totalCorrectAnswers);
        if (percentage > 0.80) return "scoreItemHigh";
        if (percentage > 0.60) return "scoreItemMedium";
        return "scoreItemLow";
    }

    const getFormattedScoreString = (note: Note) => {
        const totalAnswers = note.totalCorrectAnswers + note.totalWrongAnswers;
        const percentage = Math.round((100 * note.totalCorrectAnswers / totalAnswers));
        const percentageString = " ".repeat(3 - `${percentage}`.length) + percentage + "%";
        return `${note.timeWeightedCorrectness}, ${percentageString}, ${note.totalCorrectAnswers}/${totalAnswers}`;
    }

    const onDeleteNote = async () => {
        if (!selectedNote || !selectedNote.id) return;
        await electronAPI.deleteNote(selectedNote.id);
        const updatedNotes: Note[] = await electronAPI.getAllNotes();
        notesStore.update(() => updatedNotes);
        selectedNote = undefined;
    }

    const onEditNote = async () => {
        if (!selectedNote) return;
        editedNoteStore.set(selectedNote);
        await onDeleteNote();
        updateTab("add");
    }

</script>

<style>
    input {
        background: none;
        border: none;
        outline: none;
        font-size: 16px;
        width: 400px;
    }

    .searchBar {
        margin-bottom: 10px;
        width: 100%;
    }

    .resultsCountText {
        margin-bottom: 30px;
        font-size: 12px;
        color: var(--main-color-gray);
    }

    .editPanel {
        margin-bottom: 30px;
    }

    .noteItemRow {
        font-size: 0px;
        cursor: pointer;
        margin-bottom: 20px;
        border-bottom: 1px solid var(--main-color-background);
    }

    .noteItemRow:hover {
        border-bottom: 1px dashed var(--main-color-gray);
    }

    .noteItemRowSelected {
        border-bottom: 1px dashed var(--main-color-blue);
    }

    .noteItem {
        vertical-align: top;
        display: inline-block;
        width: 20%;
        font-size: 12px;
    }
    
    .noteItemLarge { width: 40%; }
    .dateItem { color: var(--main-color-gray); width: 10%; }
    .scoreItem { color: var(--main-color-gray); width: 10%; white-space: pre; }
    .scoreItemHigh { color: var(--main-color-green); }
    .scoreItemMedium { color: var(--main-color-yellow); }
    .scoreItemLow { color: var(--main-color-red); }
</style>

<div>
    <div class="searchBar">
        <input bind:value="{searchText}" placeholder="search..."/>
    </div>
    <div class="resultsCountText">{filteredNotes.length} result{filteredNotes.length === 1 ? "" : "s"}</div>
    {#if selectedNote}
    <div class="editPanel">
        <button on:click="{() => onEditNote()}">Edit</button>
        <button on:click="{() => onDeleteNote()}">Delete</button>
        <button on:click="{() => selectedNote = undefined}">Cancel</button>
    </div>
    {/if}
    {#each filteredNotes as note}
        <div class={`noteItemRow ${selectedNote && selectedNote.id === note.id ? "noteItemRowSelected" : ""}`} on:click="{() => selectedNote = note}">
            <span class="noteItem">{note.simplified}</span>
            <span class="noteItem">{note.pinyin}</span>
            <span class="noteItem noteItemLarge">{JSON.parse(note.english).map((d, i) => `(${i + 1}) ${d}`)}</span>
            <span class={`noteItem scoreItem ${getScoreItemClass(note)}`}>
                {note.totalWrongAnswers === 0 && note.totalCorrectAnswers === 0 ?
                    "no data" :
                    getFormattedScoreString(note)}
            </span>
            <span class="noteItem dateItem">{new Date(note.timeCreated).toLocaleDateString()}</span>
        </div>
    {:else}
        <small>No notes.</small>
    {/each}
</div>
