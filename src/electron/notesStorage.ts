import type { Database } from 'better-sqlite3';
import * as BetterSqlite3 from 'better-sqlite3';
const { join } = require("path");
import { app, ipcMain } from 'electron';
import { IPCHandlers, Note, NoteType } from '../common/constants';
import logger from './utils/logger';
const DatabaseConstructor = BetterSqlite3.default;

/**
 * This file sets up the API for saving/fetching saved notes
 * (words, phrases, grammar notes, etc).
 *
 * Note Database Schema (notes.db)
 *   id: number
 *   type: number
 *   english: string, ex="[definition1, definition2]"
 *   pinyin: string, ex="[hen3, hao3]"
 *   pinyinSearchable: string, ex="hen hao"
 *   simplified: string
 *   notes: string
 * 
 */

let database: Database;
const isProd = process.env.NODE_ENV === "production" || app.isPackaged;

const loadDatabase = () => {
    const dbPath = isProd ?
        join(app.getAppPath(), "..", "src", "assets", "notes.db") :
        join(__dirname, "..", "assets", "notes.db");
        database = new DatabaseConstructor(dbPath);
    logger.info(`Loaded notes database from ${dbPath}.`);

    // Create empty notes table if one does not exist.
    const tables = database.prepare("SELECT * FROM sqlite_master WHERE type='table'").all();
    if (tables.filter(table => table.name === "notes").length === 0) {
        database.prepare("CREATE TABLE notes(id INTEGER PRIMARY KEY,type,english,pinyin,pinyinSearchable,simplified,notes)").run();
        logger.info("Created empty notes table in database.");
    }
}

const loadStorageHandlers = () => {
    loadDatabase();

    const pinyinArrayToSearchable = (note: Note): string => note.pinyin.split(" ").map(word =>
        /[12345]/.test(word.substring(word.length - 1)) ? word.substring(0, word.length - 1) : word
    ).join(" ").toLowerCase();

    // AddNewNote
    ipcMain.handle(IPCHandlers.AddNewNote, (_, note: Note) => {
        const english = JSON.stringify(note.english);
        const pinyin = JSON.stringify(note.pinyin);
        const pinyinSearchable = pinyinArrayToSearchable(note);
        database.prepare("INSERT INTO notes(type,english,pinyin,pinyinSearchable,simplified,notes) VALUES (?,?,?,?,?)")
            .run([note.type.toString(), english, pinyin, pinyinSearchable, note.simplified, note.notes]);
    });

    // AddNewNotes
    ipcMain.handle(IPCHandlers.AddNewNotes, (_, notes: Note[]) => {
        const statement = database.prepare("INSERT INTO notes(type,english,pinyin,pinyinSearchable,simplified,notes) VALUES (?,?,?,?,?)");
        database.transaction(() => {
            notes.forEach(note => {
                const english = JSON.stringify(note.english);
                const pinyin = JSON.stringify(note.pinyin);
                const pinyinSearchable = pinyinArrayToSearchable(note);
                statement.run([note.type.toString(), english, pinyin, pinyinSearchable,, note.simplified, note.notes]);
            });
        })();
    });

    // DeleteNote
    ipcMain.handle(IPCHandlers.DeleteNote, (_, id: number) => {
        database.prepare(`DELETE FROM notes where id = ${id}`).run();
    });

    // GetAllNotes
    ipcMain.handle(IPCHandlers.GetAllNotes, (_) => {
        return database.prepare(`SELECT * FROM notes`).all();
    });

    // GetAllNotesOfType
    ipcMain.handle(IPCHandlers.GetNotesOfType, (_, type: NoteType) => {
        return database.prepare(`SELECT * FROM notes WHERE type = ${type.toString()}`).all();
    });

    // UpdateNote
    ipcMain.handle(IPCHandlers.UpdateNote, (_, newNote: Note) => {
        const english = JSON.stringify(newNote.english);
        const pinyin = JSON.stringify(newNote.pinyin);
        const pinyinSearchable = pinyinArrayToSearchable(newNote);
        return database.prepare(`UPDATE notes SET type = ${newNote.type}, english = ${english}, `
            + `pinyin=${pinyin}, pinyinSearchable=${pinyinSearchable}, `
            + `simplified=${newNote.simplified}, notes=${newNote.notes} WHERE id = ${newNote.id}`).run();
    });
}

export { loadStorageHandlers };