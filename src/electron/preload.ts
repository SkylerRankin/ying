const { contextBridge, ipcRenderer } = require('electron')
import { ElectronAPIName, IPCHandlers, Note, NoteType } from '../common/constants';

contextBridge.exposeInMainWorld(ElectronAPIName, {
    [IPCHandlers.AddNewNote]: (note: Note) => ipcRenderer.invoke(IPCHandlers.AddNewNote, note),
    [IPCHandlers.AddNewNotes]: (notes: Note[]) => ipcRenderer.invoke(IPCHandlers.AddNewNotes, notes),
    [IPCHandlers.DeleteNote]: (id: number) => ipcRenderer.invoke(IPCHandlers.DeleteNote, id),
    [IPCHandlers.GetAllNotes]: () => ipcRenderer.invoke(IPCHandlers.GetAllNotes),
    [IPCHandlers.GetNotesOfType]: (type: NoteType) => ipcRenderer.invoke(IPCHandlers.GetNotesOfType, type),
    [IPCHandlers.GetDictionarySearchPredictions]: (search: string) => ipcRenderer.invoke(IPCHandlers.GetDictionarySearchPredictions, search),
    [IPCHandlers.GetNotesSearchPredictions]: (search: string) => ipcRenderer.invoke(IPCHandlers.GetNotesSearchPredictions, search),
    [IPCHandlers.SaveDatabase]: () => ipcRenderer.invoke(IPCHandlers.SaveDatabase),
    [IPCHandlers.UpdateNote]: (updatedNote: Note) => ipcRenderer.invoke(IPCHandlers.UpdateNote, updatedNote),
});

export {}