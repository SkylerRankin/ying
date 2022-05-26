<script lang="ts">
    import { NoteType, type Note, type ElectronAPI } from "../../common/constants";
    import { notesStore } from "../stores";
    const electronAPI: ElectronAPI = (window as any).electronAPI;

    let typeInput = "Word"; // Default to the first option in select.
    let pinyinInput: string = "";
    let charactersInput: string = "";
    let englishInput: string = "";
    let hoveredNoteIndex: number = -1;

    let updatingDatabaseMessage: string = "";

    let notes: Note[] = [];

    const onCreateNote = () => {
        const note: Note = {
            id: 0,
            type: NoteType[typeInput as keyof typeof NoteType],
            english: englishInput,
            pinyin: pinyinInput,
            simplified: charactersInput,
            notes: "",
            timeCreated: new Date().getTime()
        };
        notes = [note, ...notes];
        pinyinInput = "";
        charactersInput = "";
        englishInput = "";
        console.log(note);
    }

    const onSave = async () => {
        updatingDatabaseMessage = "Saving to database...";
        await electronAPI.addNewNotes(notes);
        notes = [];
        const updatedNotes: Note[] = await electronAPI.getAllNotes();
        notesStore.update(() => updatedNotes);
        await electronAPI.saveDatabase();
        updatingDatabaseMessage = "Saving complete!";
        setTimeout(() => { updatingDatabaseMessage = ""; }, 2000);
    }

</script>

<style>
    table {
        width: 100%;
    }

    hr {
        border-top: 1px dashed var(--main-color-gray);
        margin: 20px 0px;
    }

    select {
        border: none;
        outline: none;
        box-shadow: none;
    }

    .title { color: var(--main-color-green); margin-bottom: 20px; }
    .inputTable { margin-bottom: 20px; }

    .inputTable tr td textarea {
        width: 100%;
        resize: none;
        outline: none;
        background: none;
        border: none;
    }

    .noteEditButtons { display: inline-block; width: 80px; }
    .noteOutputItem { display: inline-block; width: 200px; }
    .noteOutputRow:hover { border-bottom: 1px dashed var(--main-color-gray); }
    .addButton, .saveButton { color: var(--main-color-blue); }


</style>

<div class="title">input new words!</div>

<div class="inputContainer">
    <table class="inputTable">
        <tr>
            <td style="vertical-align: top;">
                <select bind:value="{typeInput}">
                    <option>Word</option>
                    <option>Phrase</option>
                    <option>Sentence</option>
                    <option>Grammar</option>
                </select>
            </td>
            <td>
                <textarea placeholder="pinyin..." bind:value="{pinyinInput}"/>
            </td>
            <td>
                <textarea placeholder="characters..." bind:value="{charactersInput}"/>
            </td>
            <td>
                <textarea placeholder="english..." bind:value="{englishInput}"/>
            </td>
        </tr>
    </table>
    <button class="addButton" on:click="{onCreateNote}">Add</button>
    <button class="saveButton" on:click="{onSave}">Save</button>
    <span class="databaseUpdateText">{ updatingDatabaseMessage }</span>
</div>

<hr/>

<div>
    {#each notes as note, index}
        <div class="noteOutputRow" on:mouseenter="{() => hoveredNoteIndex = index}" on:mouseleave="{() => hoveredNoteIndex = -1}">
            <span class="noteEditButtons">
                {#if hoveredNoteIndex === index}
                <button>X</button>
                <button>Edit</button>
                {/if}
            </span>
            <span class="noteOutputItem">
                { note.type }
            </span>
            <span class="noteOutputItem">
                { note.pinyin }
            </span>
            <span class="noteOutputItem">
                { note.simplified }
            </span>
            <span class="noteOutputItem">
                { note.english }
            </span>
        </div>
    {/each}
</div>

