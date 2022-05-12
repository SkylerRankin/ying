const Database = require("better-sqlite3");
const { join } = require("path");
import { app, ipcMain } from 'electron';
import { IPCHandlers } from '../common/constants';
import logger from "./utils/logger";

/**
 * This file sets up the API integration for querying the dictionary
 * database. This powers the autocomplete features when inputting
 * new words and phrases.
 */

let dictionaryDB: any;
const isProd = process.env.NODE_ENV === "production" || app.isPackaged;

const loadDictionary = () => {
    const dbPath = isProd ?
        join(app.getAppPath(), "..", "src", "assets", "dictionary.db") :
        join(__dirname, "..", "assets", "dictionary.db");
    logger.info(`Loaded dictionary database from ${dbPath}`);
    dictionaryDB = new Database(dbPath);
}

const loadPredictionHandlers = () => {
    ipcMain.handle(IPCHandlers.GetSearchPredictions, (_, searchText) => {
        const result = dictionaryDB.prepare("SELECT * FROM dictionary WHERE pinyinSearchable = ?").all([searchText]);
        return result;
    });
}

export { loadPredictionHandlers, loadDictionary }