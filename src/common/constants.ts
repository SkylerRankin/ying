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
    id: number,
    type: NoteType,
    english: string,
    pinyin: string,
    simplified: string,
    notes: string
}

export type Prediction = {
    pinyinSearchable: string,
    simplified: string
}

export interface ElectronAPI {
    addNewNote: (note: Note) => void,
    addNewNotes: (notes: Note[]) => void,
    deleteNote: (id: number) => void,
    getAllNotes: () => Note[],
    getNotesOfType: (type: NoteType) => Note[],
    getSearchPredictions: (search: string) => Prediction[],
    updateNote: (updatedNote: Note) => void
}