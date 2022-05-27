const Database = require("better-sqlite3");
const { join } = require("path");
import { app, ipcMain } from 'electron';
import { DictionaryEntry, IPCHandlers } from '../common/constants';
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
    ipcMain.handle(IPCHandlers.GetDictionarySearchPredictions, (_, searchText) => {
        const results: DictionaryEntry[] = [];
        const exactMatches: DictionaryEntry[] = dictionaryDB.prepare("SELECT * FROM dictionary WHERE pinyinSearchable = ?").all([searchText]);
        results.push(...exactMatches);

        const ids = new Set();
        results.forEach(result => ids.add(result.id));

        const maxResults = 50;

        if (results.length < maxResults) {
            const prefixMatches = dictionaryDB.prepare("SELECT * FROM dictionary WHERE pinyinSearchable LIKE ?").all([searchText + "%"]);
            prefixMatches.forEach((prefixMatch: any) => {
                if (!ids.has(prefixMatch.id)) results.push(prefixMatch);
            });
        }

        return results.slice(0, maxResults);
    });
}

export { loadPredictionHandlers, loadDictionary }