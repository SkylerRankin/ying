const { contextBridge, ipcRenderer } = require('electron')
import { OpenDialogSyncOptions } from 'electron';
import { ConfigData, ElectronAPIName, IPCHandlers, Note, NoteType, TestSelectionMode } from '../common/constants';

contextBridge.exposeInMainWorld(ElectronAPIName, {
    [IPCHandlers.AddNewNote]: (note: Note) => ipcRenderer.invoke(IPCHandlers.AddNewNote, note),
    [IPCHandlers.AddNewNotes]: (notes: Note[]) => ipcRenderer.invoke(IPCHandlers.AddNewNotes, notes),
    [IPCHandlers.DeleteNote]: (id: number) => ipcRenderer.invoke(IPCHandlers.DeleteNote, id),
    [IPCHandlers.GetAllNotes]: () => ipcRenderer.invoke(IPCHandlers.GetAllNotes),
    [IPCHandlers.GetConfigFile]: () => ipcRenderer.invoke(IPCHandlers.GetConfigFile),
    [IPCHandlers.GetNotesOfType]: (type: NoteType) => ipcRenderer.invoke(IPCHandlers.GetNotesOfType, type),
    [IPCHandlers.GetDictionarySearchPredictions]: (search: string) => ipcRenderer.invoke(IPCHandlers.GetDictionarySearchPredictions, search),
    [IPCHandlers.GetNotesForTest]: (count: number, mode: TestSelectionMode) => ipcRenderer.invoke(IPCHandlers.GetNotesForTest, count, mode),
    [IPCHandlers.GetNotesSearchPredictions]: (search: string) => ipcRenderer.invoke(IPCHandlers.GetNotesSearchPredictions, search),
    [IPCHandlers.GetAppMetadata]: () => ipcRenderer.invoke(IPCHandlers.GetAppMetadata),
    [IPCHandlers.OpenFileDialog]: (title: string, mode?: OpenDialogSyncOptions["properties"]) => ipcRenderer.invoke(IPCHandlers.OpenFileDialog, title, mode),
    [IPCHandlers.SaveDatabase]: () => ipcRenderer.invoke(IPCHandlers.SaveDatabase),
    [IPCHandlers.SaveTestResults]: (ids: number[], correct: boolean[], date: number) => ipcRenderer.invoke(IPCHandlers.SaveTestResults, ids, correct, date),
    [IPCHandlers.UpdateConfigFile]: (data: ConfigData) => ipcRenderer.invoke(IPCHandlers.UpdateConfigFile, data),
    [IPCHandlers.UpdateNote]: (updatedNote: Note) => ipcRenderer.invoke(IPCHandlers.UpdateNote, updatedNote),
});

export {}