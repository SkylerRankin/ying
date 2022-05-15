<script lang="ts">
    import type { Note } from "../../common/constants";
    import NotesHeader from "../components/NotesHeader.svelte";
    import { notesStore } from "../stores";

    let searchText: string;
    let notes: Note[];

    notesStore.subscribe(value => notes = value);


</script>

<style>
</style>

<div>
    <NotesHeader bind:searchText/>
    <code>{searchText}</code>
    {#each notes as note}
        <div>{note.english}</div>
    {:else}
        <small>No notes.</small>
    {/each}
</div>