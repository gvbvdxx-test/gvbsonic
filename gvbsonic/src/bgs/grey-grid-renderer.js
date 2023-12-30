(function () {
	class GreyGridRenderer {
		constructor (sprite) {
			//this is not required by it and does not need to be a property in the class, so im just leaving it here to make this easy to make your own bg renderers.
			this.sprite = sprite;
			
			//just setting up a place to draw the grid.
			this.canvas = document.createElement("canvas");
			this.canvas.width = 600;
			this.canvas.height = 360;
			this.context = this.canvas.getContext("2d");
			
			//this is what is needed to draw this bg but is not required.
			
			this.squareCols = 43;
			this.squareRows = 30;
			
			this.bgColor = "#4e4e4e";
			
			this.drawCount = 0;
		}
		
		drawGrid(xoffset,yoffset) {
			
			var ctx = this.context;
			var cvs = this.canvas;
			
			var x = 0;
			var y = 0;
			
			var col = 0;
			var row = 0;
			
			var i = 0;
			while (col < this.squareRows) {
				x = 0;
				row = 0;
				while (row < this.squareCols) {
					ctx.strokeStyle="#828282";
					ctx.beginPath();
					ctx.strokeRect(Math.round(x+xoffset),Math.round(y+yoffset),16,16);
					ctx.stroke();
					i += 1;
					x += 16;
					row += 1;
				}
				y += 16;
				col += 1;
			}
		}
		
		renderer (cords) {
			
			this.drawCount += 1;
						
			//just to make it faster to type them.
			var ctx = this.context;
			var cvs = this.canvas;
			
			ctx.fillStyle = this.bgColor;
			ctx.fillRect(0,0,600,360);
			
			this.drawGrid(ScratchMod(cords[0]/1.8,16)-32,0);
			
			//So gvbvdxx-renderer does support rendering canvases as images (due to it using the 2D context to draw images)
			
			return this.canvas;
		}
	}

	window.GreyGridRendererClass = GreyGridRenderer;
})();