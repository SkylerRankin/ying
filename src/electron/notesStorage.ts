import type { Database } from 'better-sqlite3';
import * as BetterSqlite3 from 'better-sqlite3';
import { join } from "path";
import { app, ipcMain } from 'electron';
import { AppMetadata, IPCHandlers, Note, NoteSearchResults, NoteTestData, NoteType, TestDataEntry, TestSelectionMode } from '../common/constants';
import logger from './utils/logger';
import { backupDatabase } from './backup';
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
 * The data string is stringified JSON with the following format:
 *     [ {date: number, correct: number, incorrect: number}, ... ]
 * 
 */

let notesDatabase: Database;

const isProd = process.env.NODE_ENV === "production" || app.isPackaged;
const notesDatabasePath: string = isProd ?
    join(app.getAppPath(), "..", "src", "assets", "notes.db") :
    // In dev mode, save the database in the source assets directory. This way
    // it is persisted between runs of the application.
    join(__dirname, "..", "..", "src", "assets", "notes.db");

const pinyinArrayToSearchable = (note: Note): string => note.pinyin.split(" ").map(word =>
    /[12345]/.test(word.substring(word.length - 1)) ? word.substring(0, word.length - 1) : word)
    .join(" ").toLowerCase();

const loadDatabase = () => {
    notesDatabase = new DatabaseConstructor(notesDatabasePath);

    logger.info(`Loaded notes database from ${notesDatabasePath}`);

    // Create empty notes table if one does not exist.
    const tables = notesDatabase.prepare("SELECT * FROM sqlite_master WHERE type='table'").all();
    if (tables.filter(table => table.name === "notes").length === 0) {
        notesDatabase.prepare("CREATE TABLE notes(id INTEGER PRIMARY KEY,type,english,englishSearchable,pinyin,pinyinSearchable,simplified,notes,timeCreated,totalCorrectAnswers,totalWrongAnswers,timeWeightedCorrectness)").run();
        logger.info("Created empty notes table in database.");
    }

    if (tables.filter(table => table.name === "test").length === 0) {
        notesDatabase.prepare("CREATE TABLE test(id INTEGER PRIMARY KEY,data)").run();
        logger.info("Created empty test table in database.");
    }
}

// Calculates the time weighted correctness for a note.
const getTimeWeightedCorrectness = (testData: TestDataEntry[]) => {
    /**
     * TODO: calculate a score representing how well I know this word. Should weight
     * more recently correct answers higher than older ones. This doesn't work too well
     * right now since a word that hasn't been testing in a long time has to recalculate
     * the value each time you open the app, lowering its score each time since it hasn't
     * been tested in a while. Not sure if that is the right course of action.
     */
    return testData.length - testData.length;
}

// Updates each note with newly calculated test results.
const updateNotesWithTestResults = (newTestData: { [id: number]: TestDataEntry[] }) => {
    // Get all of the currently stored notes.
    const notes: Note[] = notesDatabase.prepare("SELECT * from notes").all();

    // Update each note with its new score data.
    for (let i = 0; i < notes.length; i++) {
        const testData: TestDataEntry[] = newTestData[notes[i].id as number];
        const totalCorrect = testData.reduce((curr, entry) => curr + entry.correct, 0);
        const totalWrong = testData.reduce((curr, entry) => curr + entry.incorrect, 0);
        const timeWeightedCorrectness = getTimeWeightedCorrectness(testData);
        notes[i].totalCorrectAnswers = totalCorrect;
        notes[i].totalWrongAnswers = totalWrong;
        notes[i].timeWeightedCorrectness = timeWeightedCorrectness;
    }

    // Update the test score columns for each note.
    const scoreUpdateStatement = notesDatabase.prepare("UPDATE notes SET totalCorrectAnswers = ?, totalWrongAnswers = ?, timeWeightedCorrectness = ? WHERE id = ?");
    notesDatabase.transaction(() => {
        notes.forEach((note: Note) => {
            scoreUpdateStatement.run([note.totalCorrectAnswers, note.totalWrongAnswers, note.timeWeightedCorrectness, note.id]);
        });
    })();
}

const loadStorageHandlers = () => {
    loadDatabase();

    // AddNewNote
    ipcMain.handle(IPCHandlers.AddNewNote, (_, note: Note) => {
        const english = JSON.stringify(note.english);
        const englishSearchable = note.english;
        const pinyin = JSON.stringify(note.pinyin);
        const pinyinSearchable = pinyinArrayToSearchable(note);
        notesDatabase.prepare("INSERT INTO notes(type,english,englishSearchable,pinyin,pinyinSearchable,simplified,notes,timeCreated,totalCorrectAnswers,totalWrongAnswers,timeWeightedCorrectness) VALUES (?,?,?,?,?,?,?,?,?,?)")
            .run([note.type.toString(), english, englishSearchable, pinyin, pinyinSearchable, note.simplified, note.notes, note.timeCreated, note.totalCorrectAnswers, note.totalWrongAnswers, note.timeWeightedCorrectness]);
    });

    // AddNewNotes
    ipcMain.handle(IPCHandlers.AddNewNotes, (_, notes: Note[]) => {
        const statement = notesDatabase.prepare("INSERT INTO notes(type,english,englishSearchable,pinyin,pinyinSearchable,simplified,notes,timeCreated,totalCorrectAnswers,totalWrongAnswers,timeWeightedCorrectness) " +
            "VALUES (?,?,?,?,?,?,?,?,?,?,?)");
        notesDatabase.transaction(() => {
            notes.forEach(note => {
                const english = note.english;
                const englishSearchable = JSON.parse(note.english).join(" ");
                const pinyin = note.pinyin;
                const pinyinSearchable = pinyinArrayToSearchable(note);
                statement.run([note.type.toString(), english, englishSearchable, pinyin, pinyinSearchable, note.simplified, note.notes, note.timeCreated, note.totalCorrectAnswers, note.totalWrongAnswers, note.timeWeightedCorrectness]);
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
        backupDatabase();
        console.log(`Saved database to ${notesDatabasePath}`);
    });

    // SaveTestResults
    ipcMain.handle(IPCHandlers.SaveTestResults, async (_, ids: number[], correct: boolean[], date: number) => {
        // Condense the input information into a single object, collapsing duplicate IDs and summing the correct counts.
        // Object shape: { 123: { correct: 2, incorrect: 0 }, 124: { correct: 0, incorrect: 1 }, ... }
        const scoresById: {[id: number] : any} = {};
        ids.forEach((id: number, i: number) => {
            if (scoresById[id]) {
                if (correct[i]) scoresById[id].correct++;
                else scoresById[id].incorrect++;
            } else {
                scoresById[id] = { correct: correct[i] ? 1 : 0, incorrect: correct[i] ? 0 : 1 };
            }
        });

        // Fetch the previous test data for each ID from the database.
        const previousDataById: { [id: number]: TestDataEntry[] } = {};
        const statement = notesDatabase.prepare("SELECT * FROM test WHERE id = ?");
        notesDatabase.transaction(() => {
            Object.keys(scoresById).map(Number).forEach(id => {
                const testEntries: NoteTestData[] = statement.all([id]);
                if (testEntries && testEntries.length === 1) {
                    previousDataById[id] = JSON.parse(testEntries[0].data);
                }
            });
        })();

        // Create a new object, adding the new test data for each ID to the loaded data from database..
        const normalizedDate = new Date((new Date(date)).toDateString()).getTime();
        const newDataById: { [id: number]: TestDataEntry[] } = {};
        Object.keys(scoresById).map(Number).forEach((id: number) => {
            const { correct, incorrect } = scoresById[id];
            if (!previousDataById[id]) {
                newDataById[id] = [{ date: normalizedDate, correct, incorrect }];
            } else {
                const dateIndex = previousDataById[id].findIndex((item: any) => item.date === normalizedDate);
                if (dateIndex === -1) {
                    newDataById[id] = [...previousDataById[id], { date: normalizedDate, correct, incorrect }];
                } else {
                    newDataById[id] = previousDataById[id];
                    newDataById[id][dateIndex].correct += correct;
                    newDataById[id][dateIndex].incorrect += incorrect;
                }
            }
        });

        // Update the database with the new test data.
        const updateStatement = notesDatabase.prepare("INSERT OR REPLACE INTO test(id, data) VALUES(?, ?)");
        notesDatabase.transaction(() => {
            Object.keys(scoresById).map(Number).forEach(id => {
                const json = JSON.stringify(newDataById[id]);
                updateStatement.run([id, json]);
            });
        })();

        updateNotesWithTestResults(newDataById);
    });

    // UpdateNote
    ipcMain.handle(IPCHandlers.UpdateNote, (_, newNote: Note) => {
        const english = JSON.stringify(newNote.english);
        const pinyin = JSON.stringify(newNote.pinyin);
        const pinyinSearchable = pinyinArrayToSearchable(newNote);
        notesDatabase.prepare("UPDATE notes SET type = ?, english = ?, pinyin = ?, pinyinSearchable = ?, simplified = ?, notes = ?, totalCorrectAnswers = ?, totalWrongAnswers = ?, timeWeightedCorrectness = ? WHERE id = ?")
            .run([newNote.type, english, pinyin, pinyinSearchable, newNote.simplified, newNote.notes, newNote.totalCorrectAnswers, newNote.totalWrongAnswers, newNote.timeWeightedCorrectness, newNote.id]);
    });
}

const loadMetadataHandler = () => {
    ipcMain.handle(IPCHandlers.GetAppMetadata, (_) => {
        const appMetadata: AppMetadata = {
            isProd: isProd,
            notesDatabasePath: notesDatabasePath
        };
        return appMetadata;
    });
}

export { loadStorageHandlers, loadMetadataHandler };