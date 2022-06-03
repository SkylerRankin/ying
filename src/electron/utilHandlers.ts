import {
    app,
    BrowserWindow,
    dialog,
    ipcMain,
    OpenDialogSyncOptions
  } from "electron";
import { join } from "path";
import { readFileSync, writeFileSync, rmSync, existsSync } from "fs";
import { ConfigData, IPCHandlers } from "../common/constants";
import logger from "./utils/logger";

const isProd = process.env.NODE_ENV === "production" || app.isPackaged;
const configFilePath: string = isProd ?
    join(app.getAppPath(), "..", "src", "assets", "config.json") :
    // In dev mode, save the config in the source assets directory. This way
    // it is persisted between runs of the application.
    join(__dirname, "..", "..", "src", "assets", "config.json");

let lastConfig: ConfigData | undefined;

const loadUtilHandlers = (mainWindow: BrowserWindow) => {
    // OpenFileDialog
    ipcMain.handle(IPCHandlers.OpenFileDialog, (_, title: string, mode?: OpenDialogSyncOptions["properties"]) => {
        return dialog.showOpenDialogSync(mainWindow as BrowserWindow, {
            title,
            properties: mode ? mode : []
        });
    });

    // GetConfigFile
    ipcMain.handle(IPCHandlers.GetConfigFile, (_) => {
        if (!existsSync(configFilePath)) {
            logger.info(`No config file found, creating empty one at ${configFilePath}.`);
            const config: ConfigData = {
                backupDirectoryPath: undefined
            };
            writeFileSync(configFilePath, JSON.stringify(config), { flag: "w+" });
        }
        return JSON.parse(readFileSync(configFilePath).toString());
    });

    // UpdateConfigFile
    ipcMain.handle(IPCHandlers.UpdateConfigFile, (_, data: ConfigData) => {
        rmSync(configFilePath);
        writeFileSync(configFilePath, JSON.stringify(data));
        lastConfig = data;
    });

}

const getConfigData = () => {
    if (lastConfig === undefined) {
        lastConfig = JSON.parse(readFileSync(configFilePath).toString()) as ConfigData;
    }
    return lastConfig;
}

export { loadUtilHandlers, getConfigData }
