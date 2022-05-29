export const IPCHandlers = {
    GetDictionarySearchPredictions: "getDictionarySearchPredictions",
    GetNotesForTest: "getNotesForTest",
    GetNotesSearchPredictions: "getNotesSearchPredictions",
    GetAllNotes: "getAllNotes",
    GetNotesOfType: "getNotesOfType",
    AddNewNote: "addNewNote",
    AddNewNotes: "addNewNotes",
    UpdateNote: "updateNote",
    DeleteNote: "deleteNote",
    SaveDatabase: "saveDatabase",
    SaveSingleTestResult: "saveSingleTestResult"
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

export type DictionaryEntry = {
    id: number,
    simplified: string,
    pinyin: string,
    pinyinSearchable: string,
    english: string,
    englishSearchable: string
}

export type NoteSearchResults = {
    englishResults: Note[],
    pinyinResults: Note[]
}

export type YAxisNumberData = {
    value: number,
    row: number
}

export type GraphAxisData = {
    xAxisRow: number,
    yAxisNumbers: YAxisNumberData[]
}

export type TestMode = "characters" | "pinyin" | "english";
export type TestSelectionMode = "most recent" | "random" | "most wrong" | "auto";


export interface ElectronAPI {
    addNewNote: (note: Note) => Promise<void>,
    addNewNotes: (notes: Note[]) => Promise<void>,
    deleteNote: (id: number) => Promise<void>,
    getAllNotes: () => Promise<Note[]>,
    getNotesOfType: (type: NoteType) => Promise<Note[]>,
    getDictionarySearchPredictions: (search: string) => Promise<DictionaryEntry[]>,
    getNotesForTest: (count: number, mode: TestSelectionMode) => Promise<Note[]>,
    getNotesSearchPredictions: (search: string) => Promise<NoteSearchResults>,
    saveDatabase: () => Promise<void>,
    saveSingleTestResult: (id: number, correct: number, incorrect: number, date: number) => Promise<void>,
    updateNote: (updatedNote: Note) => Promise<void>
}
