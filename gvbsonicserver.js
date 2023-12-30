console.log("Server is starting...");
var ws = require("ws");
var wsCount = 1;
var wsServer = new ws.WebSocketServer({
    port: 5824
});
var fs = require("fs");

wsServer.on("connection", function (ws) {
    wsCount += 1;
	var wsPID = wsCount;
    ws.on("close", function (data) {
        wsServer.clients.forEach((ws) => {
            //send the movment updates to other websocket clients.
			console.log("[GVBSONIC]: Player "+wsCount+" disconnected!");
            ws.send(JSON.stringify({
                    type: "DISCONNECT",
                    id: wsPID
                }));
        });
        wsCount -= 1;
    })
    ws.on("message", function (data) {
        var json = JSON.parse(data.toString());

        if (json.type == "SOUND") {
            wsServer.clients.forEach((ws) => {
                //send the movment updates to other websocket clients.
                ws.send(JSON.stringify(json));
            });
        }

        if (json.type == "UPDATE") { //gives the basic movement updates
            wsServer.clients.forEach((ws) => {
                //send the movment updates to other websocket clients.
                ws.send(JSON.stringify(json));
            });
        }
    })
	console.log("[GVBSONIC]: Player "+wsPID+" is connecting...");
    //send the player id data over to the player.
    ws.send(JSON.stringify({
            type: "ID",
            id: wsPID
        }));
})

console.log("[GVBSONIC]: Server is listening on "+5824);