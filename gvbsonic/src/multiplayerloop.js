var wsServer = null;
var joinWSServer = null;
var wsCount = 1;
var globalPID = 1;
async function movePlayers() {
	for (var plr of window.PlayerSprites) {
		if (plr) {
			if (!plr.sx) {
				plr.sx = 0;
			}
			if (!plr.sy) {
				plr.sy = 0;
			}
			plr.x = plr.sx+window.levelspr.x;
			plr.y = plr.sy+window.levelspr.y;
		}
	}
}
async function handleMessage(json,sendfunct) {
	if (json.type == "ID") {
		globalPID = json.id;
	}
	if (json.type == "SOUND") {
		if (!(json.id == globalPID)) {
			//console.log("Got sound message");
			if (!((Math.abs(player.y+window.levelspr.y) > 180)||(Math.abs(player.x+window.levelspr.x) > 300))) {
				window.handlePlaySound(json.sound,json.speed,true); //the true means no emit event (dont send the ws message)
			}
		}
	}
	if (json.type == "DISCONNECT") {
		var ps =window.PlayerSprites[json.id];
		if (ps) {
			ps.visible = false;
		}
	}
	if (json.type == "UPDATE") {
			var ps =window.PlayerSprites[json.id];
			if (!window.PlayerSprites[json.id]) {
				ps = new window.GRender.Sprite(-200, 0, window.files.maniaSonic, 32, 40);
				ps.sx = 0;
				ps.sy = 0;
				
			}
			if ((json.id == globalPID)) {
				ps.visible = false;
			} else {
				ps.visible = true;
			}
			ps.scale = json.scale;
			ps.flipH = json.flipH;
			ps.flipX = json.flipX;
			ps.sx = json.x;
			ps.sy = json.y;
			
			ps.width = json.width;
			ps.height = json.height;
			ps.direction = json.dir;
			ps.imageLocation = json.frame;
			
			window.PlayerSprites[json.id] = ps;  
	}
}
async function runJOINLoop(wsurl) {
	//Managing a WS host is diffrent because most messages need to be send to all ws clients, however the api is almost the same for hosting and joining.
	window.wsConnection = null;
	function connect() {
	window.isConnectingMulti = true;
	window.wsConnection = new WebSocket("ws://"+wsurl);
	window.wsConnection.onmessage=(e) => {
		var data = e.data;
		handleMessage(JSON.parse(data),(d) => {window.wsConnection.send(d);})
	};
	window.wsConnection.onopen = (data) => {
		window.isConnectingMulti = false;
		MultiAPI.onMainGameSound = async function (sound,speed) {
			window.wsConnection.send(JSON.stringify({
				type:"SOUND",
				speed:speed,
				sound:sound,
				id:globalPID,
				x:sonic.x-window.levelspr.x,
				y:sonic.y-window.levelspr.y
			}));
		};
		setTimeout(runJoinSendLoop,500);
	};
	window.wsConnection.onclose = function () {
		//try to reconnect
		connect();
	};
	window.wsConnection.onerror = function () {
		//try to reconnect
		connect();
	};
	}
	connect();
}
async function runJoinSendLoop() {
	setInterval(() => {
		try{
			window.wsConnection.send(JSON.stringify({
				type:"UPDATE",
				frame:sonic.imageLocation,
				x:sonic.x-window.levelspr.x,
				y:sonic.y-window.levelspr.y,
				flipH:sonic.flipH,
				flipX:sonic.flipX,
				scale:sonic.scale,
				dir:sonic.direction,
				width:sonic.width,
				height:sonic.height,
				id:globalPID
			}))
		}catch(e){}
	},1000/60)
}
async function runHostSendLoop() {
	setInterval(() => {
		try{
			wsServer.clients.forEach((ws) => {
				ws.send(JSON.stringify({
					type:"UPDATE",
					frame:sonic.imageLocation,
					x:sonic.x-window.levelspr.x,
					y:sonic.y-window.levelspr.y,
					flipH:sonic.flipH,
					flipX:sonic.flipX,
					scale:sonic.scale,
					dir:sonic.direction,
					width:sonic.width,
					height:sonic.height,
					id:globalPID
				}))
			});
		}catch(e){}
	},1000/60)
}
async function runHOSTLoop() {
	//Managing a WS host is diffrent because most messages need to be send to all ws clients, however the api is almost the same for hosting and joining.
	try{
		var ws = require("ws");
		runHostSendLoop();
		wsServer = new ws.WebSocketServer({port:5824});
		MultiAPI.onMainGameSound = async function (sound,speed) {
			wsServer.clients.forEach((ws) => {
				//play the sound on other websocket clients.
				ws.send(JSON.stringify({
					type:"SOUND",
					speed:speed,
					sound:sound,
					id:globalPID,
					x:sonic.x-window.levelspr.x,
					y:sonic.y-window.levelspr.y
				}));
			});
		};
		wsServer.on("connection",function (ws) {
			wsCount += 1;
			ws.on("close",function (data) {
				handleMessage({
					type:"DISCONNECT",
					id:wsCount
				});
				wsServer.clients.forEach((ws) => {
						//send the movment updates to other websocket clients.
						ws.send(JSON.stringify({
							type:"DISCONNECT",
							id:wsCount
						}));
					});
				wsCount -= 1;
			})
			ws.on("message",function (data) {
				var json = JSON.parse(data.toString());
				
				if (json.type == "SOUND") {
					handleMessage(json,(d) => { //same data when reciving, so just directly send it.
						ws.send(d); //function for sending ws message
					}); 
					wsServer.clients.forEach((ws) => {
						//send the movment updates to other websocket clients.
						ws.send(JSON.stringify(json));
					});
				}
				
				if (json.type == "UPDATE") { //gives the basic movement updates
					handleMessage(json,(d) => { //same data when reciving, so just directly send it.
						ws.send(d); //function for sending ws message
					}); 
					wsServer.clients.forEach((ws) => {
						//send the movment updates to other websocket clients.
						ws.send(JSON.stringify(json));
					});
				}
			})
			//send the player id data over to the player.
			ws.send(JSON.stringify({
				type:"ID",
				id:wsCount
			}));
		})
	}catch(e){
		window.alert("either requiring modules are not supported, or WS module is not installed.");
	}
	
}
var connectingNotificationSprite = null;
window.isConnectingMulti = false;
async function runMultiPLayerLoop(type,wsurl) {
	if (type == "JOIN") {
		runJOINLoop(wsurl);
	}
	if (type == "HOST") {
		window.isConnectingMulti = false; //hosting does not need connecting.
		runHOSTLoop();
	}
	connectingNotificationSprite = new window.GRender.Sprite(0, 0, window.files.mutliConnecting, 278, 60);
	window.PlayerSprites = [];
	window.overEngineSprites = [];
	setInterval(function () {
		if (window.isConnectingMulti) {
			window.PlayerSprites = [];
			window.overEngineSprites = [connectingNotificationSprite];
			return;
		}
		movePlayers();
		
		window.overEngineSprites = [];
		for (var spr of window.PlayerSprites) {
			if (spr) {
				window.overEngineSprites.push(spr);
			}
		}
		

	},1000/60)
	while (true) {
		var multizone = await fetchJSON("res/levels/multiplayer/multizone.json");
		await loadLevelData(multizone,window.files.music.SHZ);
	}
}