<script lang="ts">
    import { NoteType, type Note, type ElectronAPI } from "../../common/constants";
import { notesStore } from "../stores";
    const electronAPI: ElectronAPI = (window as any).electronAPI;

    let typeInput = "Word"; // Default to the first option in select.
    let pinyinInput: string = "";
    let charactersInput: string = "";
    let englishInput: string = "";

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
    }

    const onSave = async () => {
        updatingDatabaseMessage = "Saving to database...";
        await electronAPI.addNewNotes(notes);
        notes = [];
        const updatedNotes: Note[] = await electronAPI.getAllNotes();
        notesStore.update(() => updatedNotes);
        updatingDatabaseMessage = "Saving complete!";
        setTimeout(() => { updatingDatabaseMessage = ""; }, 2000);
    }

</script>

<style>
    .inputTable {
        width: 100%;
    }

    .inputTable tr th {
        text-align: left;
    }

    .inputTable tr td textarea {
        width: 100%;
        border-radius: 10px;
        resize: none;
    }

    .inputContainer {
        border: solid 1px lightgray;
        border-radius: 10px;
        padding: 20px;
    }

    .header {
        position: relative;
    }

    .databaseUpdateText {
        text-align: center;
        width: 200px;
        position: absolute;
        top: 20px;
        right: 100px;
    }

    .saveButton {
        width: 60px;
        position: absolute;
        top: 20px;
        right: 20px;
    }

</style>

<div class="header">
    <h1>Input words</h1>
    <div class="databaseUpdateText">{ updatingDatabaseMessage }</div>
    <button class="saveButton" on:click="{onSave}">Save</button>
</div>


<div class="inputContainer">
    <table class="inputTable">
        <tr>
            <th>Type</th>
            <th>Pinyin</th>
            <th>Characters</th>
            <th>English</th>
        </tr>
        <tr>
            <td>
                <select bind:value="{typeInput}">
                    <option>Word</option>
                    <option>Phrase</option>
                    <option>Sentence</option>
                    <option>Grammar</option>
                </select>
            </td>
            <td>
                <textarea bind:value="{pinyinInput}"/>
            </td>
            <td>
                <textarea bind:value="{charactersInput}"/>
            </td>
            <td>
                <textarea bind:value="{englishInput}"/>
            </td>
        </tr>
    </table>
    <button on:click="{onCreateNote}">Create</button>
</div>

<div>
    Prediction Panel
</div>

<hr/>

<div>
    <table class="inputTable">
        <tr>
            <th></th>
            <th>Type</th>
            <th>Pinyin</th>
            <th>Characters</th>
            <th>English</th>
        </tr>
        {#each notes as note}
            <tr>
                <td>
                    <button>X</button>
                    <button>Edit</button>
                </td>
                <td>
                    { note.type }
                </td>
                <td>
                    { note.pinyin }
                </td>
                <td>
                    { note.simplified }
                </td>
                <td>
                    { note.english }
                </td>
            </tr>
        {/each}
    </table>
</div>

