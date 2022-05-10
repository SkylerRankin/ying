const { contextBridge, ipcRenderer } = require('electron')
import { ElectronAPIName, IPCHandlers } from '../common/constants';

contextBridge.exposeInMainWorld(ElectronAPIName, {
    [IPCHandlers.GetSearchPredictions]: (search: string) => ipcRenderer.invoke(IPCHandlers.GetSearchPredictions, search)
});

export {}