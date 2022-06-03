import { writable } from 'svelte/store';
import type { Note, ElectronAPI, ConfigData } from '../common/constants';
const electronAPI: ElectronAPI = (window as any).electronAPI;

// The total list of notes fetched from the database.
export const notesStore = writable([] as Note[]);
(async () => {
    const notes: Note[] = await electronAPI.getAllNotes();
    notesStore.update((_) => notes);
})();

// The note selected to be edited. It is selected in the notes page and
// then used in the word input page.
export const editedNoteStore = writable(null as (null | Note));

// The data from the config file.
export const configDataStore = writable({} as ConfigData);
(async () => {
    const data = await electronAPI.getConfigFile();
    configDataStore.set(data);
})();

configDataStore.subscribe(async configData => {
    await electronAPI.updateConfigFile(configData);
});
