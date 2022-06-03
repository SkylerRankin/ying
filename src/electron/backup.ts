import { copyFileSync, readdirSync, rmSync } from "fs";
import { app } from 'electron';
import { join } from "path";
import { getConfigData } from "./utilHandlers";
import { ConfigData } from "../common/constants";
import logger from "./utils/logger";

const isProd = process.env.NODE_ENV === "production" || app.isPackaged;
const notesDatabasePath: string = isProd ?
    join(app.getAppPath(), "..", "src", "assets", "notes.db") :
    join(__dirname, "..", "..", "src", "assets", "notes.db");
const maxBackupsToSave = 10;

const cleanupOldBackups = (backupPath: string) => {
    const files = readdirSync(backupPath);
    if (files.length > maxBackupsToSave) {
        files.sort().reverse().slice(maxBackupsToSave).forEach(file => {
            rmSync(join(backupPath, file));
        });
    }
}

const backupDatabase = () => {
    const config: ConfigData = getConfigData();
    if (config.backupDirectoryPath === undefined) {
        logger.error("No backup directory set in config file, cannot backup.");
        return;
    }
    const filename = "notes.db_" + new Date().getTime();
    const backupPath = join(config.backupDirectoryPath, filename);
    copyFileSync(notesDatabasePath, backupPath);
    logger.info(`Copied backup from ${notesDatabasePath} to ${backupPath}.`);
    cleanupOldBackups(config.backupDirectoryPath);
}

export { backupDatabase }