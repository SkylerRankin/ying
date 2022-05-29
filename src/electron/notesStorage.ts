import type { Database } from 'better-sqlite3';
import * as BetterSqlite3 from 'better-sqlite3';
const { join } = require("path");
import { app, ipcMain } from 'electron';
// import { writeFile } from 'fs/promises';
import { IPCHandlers, Note, NoteSearchResults, NoteType, TestSelectionMode } from '../common/constants';
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
 *   englishSearchable: string, ex="definition1 definition2"
 *   pinyin: string, ex="[hen3, hao3]"
 *   pinyinSearchable: string, ex="hen hao"
 *   simplified: string
 *   notes: string
 * 
 * Test table Schema (test.db)
 *   id: number
 *   data: string
 * 
 */

let notesDatabase: Database;

const isProd = process.env.NODE_ENV === "production" || app.isPackaged;
const notesDatabasePath: string = isProd ?
    join(app.getAppPath(), "..", "src", "assets", "notes.db") :
    // In dev mode, save the database in the source assets directory. This way
    // it is persisted between runs of the application.
    join(__dirname, "..", "..", "src", "assets", "notes.db");

const loadDatabase = () => {
    notesDatabase = new DatabaseConstructor(notesDatabasePath);

    logger.info(`Loaded notes database from ${notesDatabasePath}`);

    // Create empty notes table if one does not exist.
    const tables = notesDatabase.prepare("SELECT * FROM sqlite_master WHERE type='table'").all();
    if (tables.filter(table => table.name === "notes").length === 0) {
        notesDatabase.prepare("CREATE TABLE notes(id INTEGER PRIMARY KEY,type,english,englishSearchable,pinyin,pinyinSearchable,simplified,notes,timeCreated)").run();
        logger.info("Created empty notes table in database.");
    }

    if (tables.filter(table => table.name === "test").length === 0) {
        notesDatabase.prepare("CREATE TABLE test(id INTEGER PRIMARY KEY,data)").run();
        logger.info("Created empty test table in database.");
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
        const englishSearchable = note.english;
        const pinyin = JSON.stringify(note.pinyin);
        const pinyinSearchable = pinyinArrayToSearchable(note);
        notesDatabase.prepare("INSERT INTO notes(type,english,englishSearchable,pinyin,pinyinSearchable,simplified,notes,timeCreated) VALUES (?,?,?,?,?,?,?)")
            .run([note.type.toString(), english, englishSearchable, pinyin, pinyinSearchable, note.simplified, note.notes, note.timeCreated]);
    });

    // AddNewNotes
    ipcMain.handle(IPCHandlers.AddNewNotes, (_, notes: Note[]) => {
        const statement = notesDatabase.prepare("INSERT INTO notes(type,english,englishSearchable,pinyin,pinyinSearchable,simplified,notes,timeCreated) VALUES (?,?,?,?,?,?,?,?)");
        notesDatabase.transaction(() => {
            notes.forEach(note => {
                const english = note.english;
                const englishSearchable = JSON.parse(note.english).join(" ");
                const pinyin = JSON.stringify(note.pinyin);
                const pinyinSearchable = pinyinArrayToSearchable(note);
                statement.run([note.type.toString(), english, englishSearchable, pinyin, pinyinSearchable, note.simplified, note.notes, note.timeCreated]);
            });
        })();
    });

    // DeleteNote
    ipcMain.handle(IPCHandlers.DeleteNote, (_, id: number) => {
        notesDatabase.prepare(`DELETE FROM notes where id = ${id}`).run();
    });

    // GetAllNotes
    ipcMain.handle(IPCHandlers.GetAllNotes, (_) => {
        return notesDatabase.prepare(`SELECT * FROM notes`).all();
    });

    // GetAllNotesOfType
    ipcMain.handle(IPCHandlers.GetNotesOfType, (_, type: NoteType) => {
        return notesDatabase.prepare(`SELECT * FROM notes WHERE type = ${type.toString()}`).all();
    });

    // GetNotesForTest
    ipcMain.handle(IPCHandlers.GetNotesForTest, (_, count: number, mode: TestSelectionMode) => {
        switch (mode) {
            case "auto":
            case "most recent":
                return notesDatabase.prepare(`SELECT * FROM notes ORDER BY timeCreated DESC LIMIT ?`).all([count]);
            case "most wrong":
            case "random":
                return notesDatabase.prepare("SELECT * FROM notes WHERE id IN (SELECT id FROM notes ORDER BY RANDOM() LIMIT ?)").all([count]);
        }
    });

    // GetNotesSearchPredictions
    ipcMain.handle(IPCHandlers.GetNotesSearchPredictions, (_, searchText: string): NoteSearchResults => {
        const englishResults = notesDatabase.prepare(`SELECT * FROM notes WHERE englishSearchable LIKE ?`).all([searchText + "%"]);
        const pinyinResults = notesDatabase.prepare(`SELECT * FROM notes WHERE pinyinSearchable LIKE ?`).all([searchText + "%"]);
        return {englishResults, pinyinResults};
    });

    // SaveDatabase
    ipcMain.handle(IPCHandlers.SaveDatabase, async (_) => {
        await notesDatabase.backup(notesDatabasePath);
        console.log(`Saved database to ${notesDatabasePath}`);
    });
    
    // SaveSingleTestResult
    ipcMain.handle(IPCHandlers.SaveSingleTestResult, async (_, id: number, correct: number, incorrect: number, date: number) => {
        const json = notesDatabase.prepare("SELECT data FROM test WHERE id = ?").all([id]);
        const data: any[] = json.length === 0 ? [] : JSON.parse(json[0].data);

        const normalizedDate = new Date((new Date(date)).toDateString()).getTime();
        const dateIndex = data.findIndex(item => item.date === normalizedDate);
        if (dateIndex === -1) {
            data.push({ date: normalizedDate, correct, incorrect });
            notesDatabase.prepare("INSERT INTO test(id,data) VALUES(?,?)").run(id, JSON.stringify(data));
        } else {
            data[dateIndex].correct += correct;
            data[dateIndex].incorrect += incorrect;
            notesDatabase.prepare("UPDATE test SET data = ? WHERE id = ?").run(JSON.stringify(data), id);
        }
    });

    // UpdateNote
    ipcMain.handle(IPCHandlers.UpdateNote, (_, newNote: Note) => {
        const english = JSON.stringify(newNote.english);
        const pinyin = JSON.stringify(newNote.pinyin);
        const pinyinSearchable = pinyinArrayToSearchable(newNote);
        return notesDatabase.prepare(`UPDATE notes SET type = ${newNote.type}, english = ${english}, `
            + `pinyin=${pinyin}, pinyinSearchable=${pinyinSearchable}, `
            + `simplified=${newNote.simplified}, notes=${newNote.notes} WHERE id = ${newNote.id}`).run();
    });
}

export { loadStorageHandlers };