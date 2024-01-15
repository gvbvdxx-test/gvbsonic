class MultiplayerChat {
	constructor () {
		this.cvs = new document.createElement("canvas");
		this.cvs.width = 150;
		this.cvs.height = 300;
		this.ctx = canvasChat.getContext("2d");
		this.scrollY = 0;
		this.image = this.cvs;
		this.sprite = new window.GRender.Sprite(0, 0, window.files.mutliConnecting, 278, 60)
	}
	getImage () {
		return this.image;
	}
	updateChatMessages (chatMessages) {
		this.ctx.clearRect(0,0,this.cvs.width,this.cvs.height);
		this.ctx.fillStyle = "green";
		this.ctx.globalAlpha = 0.5;
		this.ctx.fillRect(0,0,this.cvs.width,this.cvs.height);
		this.ctx.fillStyle = "black";
		this.ctx.font = "10px pixel"; //gvbsonic's pixelated font
		this.ctx.globalAlpha = 1;
		var texty = 0;
		for (var text of chatMessages) {
			this.ctx.fillText(0,texty,text);
			texty += this.ctx.measureText(text);
		}
	}
}