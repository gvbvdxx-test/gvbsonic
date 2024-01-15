var realconsolelog = console.log;
var addConsoleStuff = function () {};
var child_process = require("child_process");
var electron = require("@electron/remote");
var fs = require("fs");
var path = require("path");
var os = require("os");
window.process = electron.require("process");
var win = electron.getCurrentWindow();

var subProcess = null;
var wsserv = null
function externalConsole() {
	if (wsserv) {
		wsserv.close();
	}
	wsserv = new (require("ws")).WebSocketServer({port:6352});
	subProcess = child_process.spawn('node',["commander.js"],{cwd:process.cwd(),detached:true,shell:true});
	
	wsserv.on("connection",(ws) => {
		ws.send("[GVBSONIC]: Devloper console is recommended more, as it can display errors.\n");
		ws.send("[GVBSONIC]: We only recommend it for executing commands, not for debugging the game.\n");
		ws.send("[GVBSONIC] "+process.cwd()+">");
		ws.on("message",async (d) => {
			try{
				ws.send(eval(d.toString())+"\n[GVBSONIC] "+process.cwd()+">");
			}catch(e){
				ws.send("\n[GVBSONIC] "+e+"\n"+process.cwd()+">");
			}
		});
		ws.on("close", () => {
			wsserv.close();
		})
	})
}
var gvbsonicConfigPath = path.join(os.homedir(),"GvbsonicConfig");
if (!fs.existsSync(gvbsonicConfigPath)) {
	fs.mkdirSync(gvbsonicConfigPath);
}
if (!fs.existsSync(path.join(gvbsonicConfigPath,"visuals.json"))) {
	fs.writeFileSync(path.join(gvbsonicConfigPath,"visuals.json"),
	JSON.stringify({
		fullscreen:false,
		sizeMultiplier:1
	},null,"\t")
	);
}
window.gvbsonicConfig = JSON.parse(fs.readFileSync(path.join(gvbsonicConfigPath,"visuals.json")));
if (!window.gvbsonicConfig.fullscreen) {
  win.setFullScreen(false);
  win.setResizable(true);
} else {
  win.setResizable(true);
  win.setFullScreen(true);
}
//"accurateley" resize the window
window.resizeTo((600*window.gvbsonicConfig.sizeMultiplier)+(window.outerWidth-window.innerWidth),(360*window.gvbsonicConfig.sizeMultiplier)+(window.outerHeight-window.innerHeight))