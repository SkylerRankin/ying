const Database = require("better-sqlite3");
const { join } = require("path");
import { app, ipcMain } from 'electron';
import { IPCHandlers } from '../common/constants';
import logger from "./utils/logger";

let dictionaryDB: any;
const isProd = process.env.NODE_ENV === "production" || app.isPackaged;

const loadDictionary = () => {
    logger.info(`process.env.NODE_ENV=${process.env.NODE_ENV}`);
    logger.info(`app.getAppPath()=${app.getAppPath()}, isPackaged=${app.isPackaged}`);
    logger.info(`__dirname=${__dirname}`);
    const dbPath = isProd ?
        join(app.getAppPath(), "..", "src", "assets", "dictionary.db") :
        join(__dirname, "..", "assets", "dictionary.db");
    logger.info(`dbPath=${dbPath}`);
    dictionaryDB = new Database(dbPath);
}

const loadPredictionHandlers = () => {
    ipcMain.handle(IPCHandlers.GetSearchPredictions, (_, searchText) => {
        const result = dictionaryDB.prepare("SELECT * FROM dictionary WHERE pinyinSearchable = ?").all([searchText]);
        return result;
    });
}

export { loadPredictionHandlers, loadDictionary }