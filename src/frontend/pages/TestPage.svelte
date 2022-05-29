<script lang="ts">
    import type { ElectronAPI, Note, TestMode, TestSelectionMode } from "../../common/constants";
    const electronAPI: ElectronAPI = (window as any).electronAPI;

    let questionMode: TestMode = "characters";
    let questionCount: number = 20;
    let selectionMode: TestSelectionMode = "auto";
    let startedTest: boolean = false;
    let finishedTest: boolean = false;
    let notesToTest: Note[] = [];
    let noteResponses: boolean[] = [];
    let currentNoteIndex: number= 0;
    let showAnswer: boolean = false;

    const questionModes: TestMode[] = ["characters", "pinyin", "english"];
    const questionCountOptions: number[] = [20, 50, 100, 250, 500];
    const selectionModes: TestSelectionMode[] = ["most recent", "random", "most wrong", "auto"];
    const selectionDescriptions = [
        "selects the most recent n notes",
        "selects n random notes",
        "selects the notes that have been incorrectly answered the most",
        "a mix of n old, commonly incorrect, and normal notes"
    ];

    const getQuestionText = () => {
        switch (questionMode) {
            case "characters": return notesToTest[currentNoteIndex].simplified;
            case "pinyin": return JSON.parse(notesToTest[currentNoteIndex].pinyin);
            case "english": return JSON.parse(notesToTest[currentNoteIndex].english).map((d, i) => `(${i + 1}) ${d}`).join(", ");
        }
    }

    const onStart = async () => {
        notesToTest = await electronAPI.getNotesForTest(questionCount, selectionMode);
        startedTest = true;
    }

    const onShowAnswer = () => {
        showAnswer = true;
    }

    const onAnswer = async (correct: boolean) => {
        showAnswer = false;
        currentNoteIndex++;
        noteResponses.push(correct);
        if (currentNoteIndex >= notesToTest.length) {
            startedTest = false;
            finishedTest = true;
            currentNoteIndex = 0;
            notesToTest.forEach(async (note: Note, i: number) => {
                const correct = noteResponses[i] ? 1 : 0;
                const incorrect = noteResponses[i] ? 0 : 1;
                await electronAPI.saveSingleTestResult(note.id as number, correct, incorrect, (new Date).getTime());
            });
            await electronAPI.saveDatabase();
            setTimeout(() => { finishedTest = false; }, 3000);
        }
    }

</script>

<style>
    .formatLabel { color: var(--main-color-gray); display: inline-block; }
    .item { color: var(--main-color-gray); cursor: pointer; margin-right: 20px; }
    .item:hover { text-decoration: underline; }
    .itemSelected { color: var(--main-color-yellow); }
    .selectionDescription {
        display: block;
        margin-left: 30px;
        font-size: 12px;
        color: var(--main-color-gray);
    }
    .configTitle {
        margin-top: 20px;
    }
    .startButton { color: var(--main-color-blue); cursor: pointer; margin-top: 40px; }
    .startButton:hover { text-decoration: underline; }
    .remainingQuestionsText { color: var(--main-color-gray); font-style: italic; }
    .answerContainer { height: 150px; margin: 20px 0px; }
    
    .showAnswerButton { color: var(--main-color-blue); cursor: pointer; }
    .showAnswerButton:hover { text-decoration: underline; }
    .markCorrectButton { color: var(--main-color-green); cursor: pointer; }
    .markCorrectButton:hover { text-decoration: underline; }
    .markIncorrectButton { color: var(--main-color-red); cursor: pointer; margin-top: 10px }
    .markIncorrectButton:hover { text-decoration: underline; }
</style>

<div>
{#if !startedTest && !finishedTest}
    <div class="configTitle">format</div>
    <div class="formatContainer">
        {#each questionModes as mode}
            <span on:click="{() => questionMode = mode}" class={`item ${questionMode === mode ? "itemSelected" : ""}`}>{mode}</span>
        {/each}
    </div>

    <div class="configTitle">count</div>

    <div>
    {#each questionCountOptions as count}
        <span on:click="{() => questionCount = count}" class={`item ${questionCount === count ? "itemSelected" : ""}`}>{count}</span>
    {/each}
    </div>

    <div class="configTitle">selection</div>
    {#each selectionModes as mode}
        <span on:click="{() => selectionMode = mode}" class={`item ${selectionMode === mode ? "itemSelected" : ""}`}>{mode}</span>
    {/each}
    <i class="selectionDescription">{selectionDescriptions[selectionModes.indexOf(selectionMode)]}</i>

    <div class="startButton" on:click="{onStart}">start</div>
    {/if}

    {#if startedTest}
    <div class="remainingQuestionsText">{notesToTest.length - currentNoteIndex} remaining notes</div>
    <div class="answerContainer">
        {#if showAnswer}
            <div>{ notesToTest[currentNoteIndex].simplified }</div>
            <div>{ JSON.parse(notesToTest[currentNoteIndex].pinyin) }</div>
            <div>{ JSON.parse(notesToTest[currentNoteIndex].english).map((d, i) => `(${i + 1}) ${d}`).join(", ") }</div>
        {:else}
            { getQuestionText() }
        {/if}
    </div>
    
    <br/>
    {#if showAnswer}
        <div on:click="{() => onAnswer(false)}" class="markIncorrectButton">mark incorrect</div>
        <div on:click="{() => onAnswer(true)}" class="markCorrectButton">mark correct</div>
    {:else}
        <div on:click="{onShowAnswer}" class="showAnswerButton">show answer</div>
    {/if}

{/if}

{#if finishedTest}
    Test complete. {noteResponses.filter(a => a).length} / {noteResponses.length} correct.
{/if}

</div>