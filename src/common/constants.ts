export const IPCHandlers = {
    GetSearchPredictions: "getSearchPredictions",
    GetAllNotes: "getAllNotes",
    GetNotesOfType: "getNotesOfType",
    AddNewNote: "addNewNote",
    AddNewNotes: "addNewNotes",
    UpdateNote: "updateNote",
    DeleteNote: "deleteNote"
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

export interface ElectronAPI {
    addNewNote: (note: Note) => Promise<void>,
    addNewNotes: (notes: Note[]) => Promise<void>,
    deleteNote: (id: number) => Promise<void>,
    getAllNotes: () => Promise<Note[]>,
    getNotesOfType: (type: NoteType) => Promise<Note[]>,
    getSearchPredictions: (search: string) => Promise<Prediction[]>,
    updateNote: (updatedNote: Note) => Promise<void>
}
