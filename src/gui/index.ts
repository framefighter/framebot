import { BrowserWindow, app } from "electron"
import path from "path"

function createWindow() {
    // Erstelle das Browser-Fenster.
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, './renderer.js')
        },
        // frame: false,
        autoHideMenuBar: true,
        darkTheme: true,
    })

    // and load the index.html of the app.
    win.loadFile("./index.html")
}
if (app) {
    app.on('ready', createWindow)
}