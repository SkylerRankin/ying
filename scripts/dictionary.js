/**
This script is used to create a sqlite database from the CC-CEDICT
dictionary file (https://www.mdbg.net/chinese/dictionary?page=cc-cedict).
This should only need to be done once, and the resulting database file
should be manually copied into the src/electron/assets directory.
*/

const { readFileSync } = require("fs");
const { join } = require("path");

const dictionaryPath = join(__dirname, "assets", "cedict_ts.u8");

const rawText = readFileSync(dictionaryPath, {encoding: 'utf-8' });
const lines = rawText.split("\n");

const parseLine = line => {

    // Syntax: Traditional Simplified [pin1 yin1] /gloss; gloss; .../gloss; gloss; .../
    line = line.trim();

    let remainingText = line;
    let firstSpaceIndex = remainingText.indexOf(" ");
    const traditional = remainingText.substring(0, firstSpaceIndex);
    remainingText = remainingText.substring(traditional.length + 1);

    firstSpaceIndex = remainingText.indexOf(" ");
    const simplified = remainingText.substring(0, firstSpaceIndex);
    remainingText = remainingText.substring(simplified.length + 1);

    const openingBracketIndex = remainingText.indexOf("[");
    const closingBracketIndex = remainingText.indexOf("]");
    const pinyin = remainingText.substring(openingBracketIndex + 1, closingBracketIndex).split(" ");
    const pinyinSearchable = pinyin.map(word =>
        /[12345]/.test(word.substring(word.length - 1)) ? word.substring(0, word.length - 1) : word
    ).join(" ").toLowerCase();
    remainingText = remainingText.substring(closingBracketIndex + 2);

    if (remainingText.endsWith("/")) {
        remainingText = remainingText.substring(0, remainingText.length - 1)
    }

    if (remainingText.startsWith("/")) {
        remainingText = remainingText.substring(1)
    }

    const english = remainingText.split("/").map(text => text.trim());
    const englishSearchable = english.map(text => text.toLowerCase()).join(", ");

    return {
        simplified,
        pinyin,
        pinyinSearchable,
        english,
        englishSearchable,
        text: line
    };
}

const ignoreLine = line => {
    return line.startsWith("#");
}

let parseStats = {
    successfulLines: 0,
    failedLines: 0,
    exceptions: []
};

const dictionaryData = [];
lines.forEach(line => {
    if (!ignoreLine(line)) {
        try {
            const lineData = parseLine(line);
            dictionaryData.push(lineData);
            parseStats.successfulLines++;
        } catch (e) {
            parseStats.failedLines++;
            parseStats.exceptions.push(e);
        }
    }
});

console.log(parseStats);

const Database = require("better-sqlite3");
const dbPath = join(__dirname, "assets", "dictionary.db");
const db = new Database(dbPath);

console.log(`Loaded database from ${dbPath}`);

try {
    db.prepare("DROP TABLE dictionary").run();
} catch (e) {}

const tables = db.prepare("SELECT * FROM sqlite_master WHERE type='table'").all();
const tablesText = `Tables (${tables.length}): ${tables.map(t => t.name).join(", ")}`;
console.log(tablesText);

if (tables.length === 0) {
    db.prepare("CREATE TABLE dictionary(id INTEGER PRIMARY KEY,simplified,pinyin,pinyinSearchable,english,englishSearchable)").run();
}

const startTime = new Date();
let insertions = 0;

const logInsertionStats = () => {
    const endTime = new Date();
    const elapsed = endTime - startTime;
    console.log(`${insertions} insertions in ${elapsed / 1000} seconds. ${insertions / (elapsed / 1000)} insertions / second.`);
}

const insertTransaction = db.prepare("INSERT INTO dictionary(simplified,pinyin,pinyinSearchable,english,englishSearchable) VALUES (?,?,?,?,?)");
db.transaction(() => {
    dictionaryData.forEach(data => {
        insertions++;
        insertTransaction.run([
            data.simplified, JSON.stringify(data.pinyin), data.pinyinSearchable, JSON.stringify(data.english), data.englishSearchable
        ]);
    });
    logInsertionStats();
})();

let result = db.prepare("SELECT * FROM dictionary WHERE pinyinSearchable LIKE 'hen'").all();
console.log(result);

result = db.prepare("SELECT * FROM dictionary WHERE pinyinSearchable = 'hen jiu'").all();
console.log(result);

// db.prepare("DROP TABLE dictionary").run();