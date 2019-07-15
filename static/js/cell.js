function Cell(x,y,i,j,scale) {
	this.x = x;
	this.y = y;
	this.i = i;
	this.j = j;
	this.scale = scale;
	this.bomb = false;
	this.flagged = false;
	this.count = -1;
	this.eCount = -1;
	this.revealed = false;
	this.hovering = false;
}

Cell.prototype.show = function() {
	if (this.revealed) {
		fill(C4);
		stroke(C1);
		strokeWeight(1);
		noStroke();
		rect(this.x, this.y, this.scale, this.scale);

		// Bomb
		if (this.bomb) {
			fill(C3);
			rect(this.x, this.y, this.scale, this.scale);
			drawBomb(this.x, this.y, this.scale, 5);

		// Number
		} else if (this.count > 0) {
			noStroke();
			fill(C1);
			textSize(this.scale);
			text(this.count, this.x + this.scale/2, this.y + this.scale/2);
			// textSize(this.scale/2);
			// fill(C3);
			// text(this.eCount, this.x + (3 * this.scale/4), this.y + this.scale/2);
		}
	} else {
		if (this.hovering) {
			drawTileOnHover(this.x, this.y, this.scale);
		} else {
			drawTile(this.x, this.y, this.scale);
		}
		// Flag
		if (this.flagged) {
			drawFlag(this.x, this.y, this.scale);
		}
	}
}

Cell.prototype.reveal = function() {
	this.revealed = true;
	if (!this.bomb && this.count == 0) {
		for (let ii = this.i - 1; ii <= this.i + 1; ii++) {
			for (let jj = this.j - 1; jj <= this.j + 1; jj++) {
				t = ijToTile(ii,jj);
				if (t != null && !t.revealed && !t.flagged) { t.reveal(); }
			}
		}
	}
	updateTile(this);
}

Cell.prototype.flag = function() {
	this.flagged = true;
	this.show();
}

Cell.prototype.unflag = function() {
	this.flagged = false;
	this.show();
}

Cell.prototype.toggleFlag = function() {
	this.flagged = !this.flagged;
	this.show();
}

Cell.prototype.hover = function() {
	this.hovering = true;
	this.show();
}

Cell.prototype.stopHover = function() {
	this.hovering = false;
	this.show();
}


Cell.prototype.contains = function(x,y) {
	return (x > this.x && x < this.x + this.scale) && (y > this.y && y < this.y + this.scale)
}

