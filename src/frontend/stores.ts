import { writable } from 'svelte/store';
import type { Note, ElectronAPI } from '../common/constants';
const electronAPI: ElectronAPI = (window as any).electronAPI;

export const notesStore = writable([] as Note[]);
(async () => {
    const notes: Note[] = await electronAPI.getAllNotes();
    notesStore.update((_) => notes);
})();

export const editedNoteStore = writable(null as (null | Note));
