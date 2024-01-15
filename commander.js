process.title = "Gvbvdxx Sonic Engine Commander";
var stdout = process.stdout;
var stdin = process.stdin;

var ws = require("ws");
var wsConnection = new ws.WebSocket("ws://localhost:"+6352);

wsConnection.on("open",() => {
	stdin.on('data', data => {
		wsConnection.send(data);
	});
	wsConnection.on("message",(d) => {
		stdout.write(d.toString());
	})
});
wsConnection.on("close",() => {
	process.exit();
})