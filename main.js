//set this to true to enable the devlopment tab

var devtools = false;


var {
    BrowserWindow,
    app,
    Tray,
    Menu,
    electron,
    dialog,
    ipcMain
} = require('electron');

var editwin = null;
var iconpath = "icon.ico";
require('@electron/remote/main').initialize();
app.on("ready",() =>{
	win = new BrowserWindow({
				resizable: true,
				width:700,
				height:460,
				icon:iconpath,
				title: "Gvbvdxx Sonic Engine",
				webPreferences: {
					nodeIntegration: true,
					contextIsolation: false
				}
			});
	win.loadFile("./gvbsonic/index.html");
	require('@electron/remote/main').enable(win.webContents);
	
	if (devtools) {
	Menu.setApplicationMenu(Menu.buildFromTemplate([
	{
		label: 'Devlopment',
		submenu:[
			{
				label:"Open DevTools",
				click: async() => {
					win.openDevTools();
				}
			},
			{
				label:"Open DevTools (for level editor)",
				click: async() => {
					editwin.openDevTools();
				}
			},
			{
				label:"Open Level Editor",
				click: async() => {
					editwin = new BrowserWindow({
								resizable: true,
								width:700,
								height:460,
								title: "Gvbvdxx Sonic Engine",
								icon:iconpath,
								webPreferences: {
									nodeIntegration: true,
									contextIsolation: false
								}
							});
					editwin.loadFile("./gvbsonic/tileeditor.html");
					require('@electron/remote/main').enable(editwin.webContents);
				}
			}
		]
	}
	]))
	} else {
		Menu.setApplicationMenu(Menu.buildFromTemplate([]));
	}
});