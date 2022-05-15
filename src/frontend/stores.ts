import { writable } from 'svelte/store';
import type { Note } from '../common/constants';

export const notesStore = writable([] as Note[]);
