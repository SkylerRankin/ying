export const IPCHandlers = {
    GetSearchPredictions: "getSearchPredictions"
};

export const ElectronAPIName: string = "electronAPI";

export interface ElectronAPI {
    getSearchPredictions: (search: string) => any[]
}