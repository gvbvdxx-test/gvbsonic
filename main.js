var isServer = false;
var devtools = false;
if (process.argv.indexOf("--devmode") > -1) {
    devtools = true;
}
if (process.argv.indexOf("--server") > -1) {
    isServer = true;
}
var path = require("path");
var iconpath = path.join(__dirname,"icon.ico");
if (!isServer) {
    var {
        BrowserWindow,
        app,
        Tray,
        Menu,
        electron,
        dialog,
        ipcMain
    } = require('electron');

    function openLevelEditor() {
        editwin = new BrowserWindow({
            resizable: true,
            width: 1000,
            height: 500,
            title: "Gvbvdxx Sonic Engine",
            icon: iconpath,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });
        editwin.loadFile("./gvbsonic/tileeditor.html");
        require('@electron/remote/main').enable(editwin.webContents);
    }

    var editwin = null;
    
    require('@electron/remote/main').initialize();
    function gvbsonicWindow() {
        win = new BrowserWindow({
            resizable: true,
            width: 1000,
            height: 500,
            icon: iconpath,
            title: "Gvbvdxx Sonic Engine",
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            //autoHideMenuBar:true
        });
        win.loadFile("./gvbsonic/index.html");
        require('@electron/remote/main').enable(win.webContents);
    }
    app.on("ready", () => {
        if (!(process.argv.indexOf("--level") > -1)) {
            gvbsonicWindow();
        } else {
            //I will add this when i get time to.
            //if (!(process.argv.indexOf("--experimental") > -1)) {
            //	console.log("NOTICE: the new version might glitch often we are trying to make this level editor better.");
            //} else {
            openLevelEditor();
            //}
            if (!(process.argv.indexOf("--devmode") > -1)) {
                console.log("We recommend you use the --devmode flag for the level editor.");
            }
        }
        if (devtools) {
            Menu.setApplicationMenu(Menu.buildFromTemplate([{
                            label: 'Devlopment',
                            submenu: [{
                                    label: "Open DevTools",
                                    click: async(menuitem, window) => {
                                        window.openDevTools();
                                    }
                                }, {
                                    label: "Reload",
                                    click: async(menuitem, window) => {
                                        window.reload();
                                    }
                                }, {
                                    label: "Close",
                                    click: async(menuitem, window) => {
                                        window.close();
                                    }
                                }, {
                                    label: "Open New Game Window",
                                    click: async(menuitem, window) => {
                                        gvbsonicWindow();
                                    }
                                }, {
                                    label: "Open Level Editor",
                                    click: async() => {
                                        openLevelEditor();
                                    }
                                }, {
                                    label: "Toggle debug mode (Only works on game, not level editor)",
                                    click: async(menuitem, window) => {
                                        window.webContents.executeJavaScript("window.debugModeEnabled = !window.debugModeEnabled;");
                                    }
                                }

                            ]
                        }
                    ]))
        } else {
            Menu.setApplicationMenu(Menu.buildFromTemplate([]));
        }
    });
} else {
    require("./gvbsonicserver.js");
}