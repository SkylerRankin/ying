import type { OpenDialogSyncOptions } from "electron";

export const IPCHandlers = {
    AuthenticateWithCode: "authenticateWithCode",
    CheckAuthorization: "checkAuthorization",
    GetDictionarySearchPredictions: "getDictionarySearchPredictions",
    GetNotesForTest: "getNotesForTest",
    GetNotesSearchPredictions: "getNotesSearchPredictions",
    GetAllNotes: "getAllNotes",
    GetNotesOfType: "getNotesOfType",
    GetAppMetadata: "getAppMetadata",
    AddNewNote: "addNewNote",
    AddNewNotes: "addNewNotes",
    UpdateNote: "updateNote",
    DeleteNote: "deleteNote",
    SaveDatabase: "saveDatabase",
    SaveTestResults: "saveTestResults",
    OpenFileDialog: "openFileDialog",
    UpdateConfigFile: "updateConfigFile",
    GetConfigFile: "getConfigFile"
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
    timeCreated: number,
    totalCorrectAnswers: number, // The total number of times this note was tested and answered correctly.
    totalWrongAnswers: number, // The total number of times this note was tested and answered incorrectly.
    timeWeightedCorrectness: number // A score that weights more recent correct answers higher than older ones.
}

export type NoteTestData = {
    id: number,
    data: string // The JSON encoded string of TestDataEntry items
}

export type TestDataEntry = {
    date: number,
    correct: number,
    incorrect: number
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

export type AppMetadata = {
    isProd: boolean,
    notesDatabasePath: string
}

export type ConfigData = {
    backupDirectoryPath: string | undefined
}

export interface ElectronAPI {
    addNewNote: (note: Note) => Promise<void>,
    addNewNotes: (notes: Note[]) => Promise<void>,
    deleteNote: (id: number) => Promise<void>,
    getAllNotes: () => Promise<Note[]>,
    getNotesOfType: (type: NoteType) => Promise<Note[]>,
    getDictionarySearchPredictions: (search: string) => Promise<DictionaryEntry[]>,
    getNotesForTest: (count: number, mode: TestSelectionMode) => Promise<Note[]>,
    getNotesSearchPredictions: (search: string) => Promise<NoteSearchResults>,
    getAppMetadata: () => AppMetadata,
    getConfigFile: () => Promise<ConfigData>,
    openFileDialog: (title: string, mode?: OpenDialogSyncOptions["properties"]) => Promise<string[]>,
    saveDatabase: () => Promise<void>,
    saveTestResults: (ids: number[], correct: boolean[], date: number) => Promise<void>,
    updateConfigFile: (data: ConfigData) => Promise<void>,
    updateNote: (updatedNote: Note) => Promise<void>
}
