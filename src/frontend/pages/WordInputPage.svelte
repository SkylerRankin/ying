<script lang="ts">
    import { NoteType, type Note, type ElectronAPI, type DictionaryEntry } from "../../common/constants";
    import { notesStore } from "../stores";
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";
    const electronAPI: ElectronAPI = (window as any).electronAPI;

    let typeInput = "Word"; // Default to the first option in select.
    let pinyinInput: string = "";
    let charactersInput: string = "";
    let englishInput: string = "";
    let hoveredNoteIndex: number = -1;

    let updatingDatabaseMessage: string = "";

    const inputTextAreaOpacity = tweened(0, { duration: 0, easing: cubicOut });

    let notes: Note[] = [];
    let predictions: DictionaryEntry[] = [];

    const onCreateNote = () => {
        const note: Note = {
            id: 0,
            type: NoteType[typeInput as keyof typeof NoteType],
            english: JSON.stringify(englishInput.split("\n")),
            pinyin: pinyinInput,
            simplified: charactersInput,
            notes: "",
            timeCreated: new Date().getTime()
        };
        console.log(note);
        console.log(JSON.parse(note.english))
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
        await electronAPI.saveDatabase();
        updatingDatabaseMessage = "Saving complete!";
        setTimeout(() => { updatingDatabaseMessage = ""; }, 2000);
    }

    const onUsePrediction = async (entry: DictionaryEntry) => {
        pinyinInput = JSON.parse(entry.pinyin).join(" ");
        charactersInput = entry.simplified;
        englishInput = JSON.parse(entry.english).join("\n");

        inputTextAreaOpacity.set(1, { duration: 0 });
        setTimeout(() => { inputTextAreaOpacity.set(0, { duration: 500 }); }, 100);
    }

    $: (async () => {
        if (pinyinInput && pinyinInput.length > 0) {
            predictions = await electronAPI.getDictionarySearchPredictions(pinyinInput);
        } else {
            predictions = [];
        }
    })();

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
        width: calc(100% - 5px);
        resize: none;
        outline: none;
        border: none;
    }

    .predictionContainer {
        display: flex;
        flex-flow: row wrap;
    }

    .predictionItem {
        margin: 10px;
        border: 1px dashed var(--main-color-background);
        border-radius: 5px;
        font-size: 12px;
        cursor: pointer;
    }

    .predictionItem:hover {
        border: 1px dashed var(--main-color-gray);
    }

    .noteEditButtons { display: inline-block; width: 80px; }
    .noteOutputItem { display: inline-block; width: 200px; vertical-align: top; }
    .noteOutputRow { margin-bottom: 20px; border-bottom: 1px dashed var(--main-color-background); }
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
                <textarea type="text" spellcheck="false" placeholder="pinyin..." style={`background-color: rgba(242, 174, 73, ${$inputTextAreaOpacity});`} bind:value="{pinyinInput}"/>
            </td>
            <td>
                <textarea placeholder="characters..." style={`background-color: rgba(242, 174, 73, ${$inputTextAreaOpacity});`} bind:value="{charactersInput}"/>
            </td>
            <td>
                <textarea placeholder="english..." style={`background-color: rgba(242, 174, 73, ${$inputTextAreaOpacity});`} bind:value="{englishInput}"/>
            </td>
        </tr>
    </table>
    <button class="addButton" on:click="{onCreateNote}">Add</button>
    <button class="saveButton" on:click="{onSave}">Save</button>
    <span class="databaseUpdateText">{ updatingDatabaseMessage }</span>
</div>

<hr/>

<div>suggestions</div>
<div class="predictionContainer">
{#each predictions as prediction}
    <div class="predictionItem" on:click="{() => onUsePrediction(prediction)}">
        <div>
            <span>{prediction.simplified}</span>
            <span>{JSON.parse(prediction.pinyin).join(" ")}</span>
        </div>
        <div>
            { JSON.parse(prediction.english).map((d, i) => `(${i + 1}) ${d}`).join("\n") }
        </div>
    </div>
{/each}
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
            { JSON.parse(note.english) }
        </span>
    </div>
{/each}
</div>

