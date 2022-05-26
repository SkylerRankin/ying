export const IPCHandlers = {
    GetDictionarySearchPredictions: "getDictionarySearchPredictions",
    GetNotesSearchPredictions: "getNotesSearchPredictions",
    GetAllNotes: "getAllNotes",
    GetNotesOfType: "getNotesOfType",
    AddNewNote: "addNewNote",
    AddNewNotes: "addNewNotes",
    UpdateNote: "updateNote",
    DeleteNote: "deleteNote",
    SaveDatabase: "saveDatabase"
};

export const ElectronAPIName: string = "electronAPI";

export enum NoteType {
    Word,
    Phrase,
    Sentence,
    Grammar
}

export type Note = {
    id?: number, // Optional since this only needs to be set at the database level, not before.
    type: NoteType,
    english: string,
    pinyin: string,
    simplified: string,
    notes: string,
    timeCreated: number
}

export type Prediction = {
    pinyinSearchable: string,
    simplified: string
}

export type NoteSearchResults = {
    englishResults: Note[],
    pinyinResults: Note[]
}

export interface ElectronAPI {
    addNewNote: (note: Note) => Promise<void>,
    addNewNotes: (notes: Note[]) => Promise<void>,
    deleteNote: (id: number) => Promise<void>,
    getAllNotes: () => Promise<Note[]>,
    getNotesOfType: (type: NoteType) => Promise<Note[]>,
    getDictionarySearchPredictions: (search: string) => Promise<Prediction[]>,
    getNotesSearchPredictions: (search: string) => Promise<NoteSearchResults>,
    saveDatabase: () => Promise<void>,
    updateNote: (updatedNote: Note) => Promise<void>
}
