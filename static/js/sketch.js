
const C1 = '#293462'
const C2 = '#216583'
const C3 = '#f76262'
const C4 = '#fff1c1'
const WHITE = 'white'
const BLACK = 'black'

let grid;
let size;
let canvasWidth;
let canvasHeight;

const waitTime = 40;
let timeSinceLastPress = 0;
let mobilePressed = 0;
let mobileTarget;

let started = false;
let fetching = false;
let resetting = false;

//*
// Expert
let cols = 30;
let rows = 16;
let numBombs = 99;
/*/
//Beginner
let cols = 10;
let rows = 10;
let numBombs = 10;
//*/

let updateQueue;
let selected = null;

let solving = false;

let tempI = 0;
let tempJ = 0;
let tankStep = true;

function setup() {
	size = min(floor(windowWidth / cols), floor(windowHeight / rows));
	canvasWidth = size * cols;
	canvasHeight = size * rows;
	numBombs = min(numBombs, cols * rows)

	createCanvas(canvasWidth, canvasHeight);
	background(C4);
	noStroke();
	textAlign(CENTER, CENTER);

	updateQueue = new Queue();

	grid = make2DArray(cols, rows);
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			grid[i][j] = new Cell(i * size, j * size, i, j, size);
			updateTile(grid[i][j]);
		}
	}
	// setBombs(99);
	generateBoards(rows,cols,numBombs);
}

function draw() {
	while (!updateQueue.empty()) {
		updateQueue.poll().show();
	}

	// Handle double press (janky way to handle mobile)
	if (mobilePressed > 0) { timeSinceLastPress++; }
	if (timeSinceLastPress > waitTime) {

		switch (mobilePressed) {
			case 1:
				if (!mobileTarget.flagged) { mobileTarget.reveal(); }
				break;
			case 2:
				if (!mobileTarget.revealed) { mobileTarget.toggleFlag(); }
				break;
			default:
				break;
		}

		timeSinceLastPress = 0;
		mobilePressed = 0;
	}

	if (selected != null) {
		selected.stopHover()
		selected = null;
	}
	if (mouseIsPressed && mouseButton === 'left') {
		let t = xyToTile(mouseX, mouseY)
		if (t != null && !t.flagged) {
			t.hover();
			selected = t;
		}
	}
	if (keyIsPressed) {
		switch(key) {
			case 's':
				solveGame();
				break;
			case 'r':
				resetGame();
				break;
		}
	}
	if (solving) {
		tankField();
		solving = false;
	}
}

function tempNextOpenTile() {
	while (tempI < cols) {
		while (tempJ < rows) {
			if (grid[tempI][tempJ].revealedm && grid[i][j].count != 0) { return true; }
			tempJ++;
		}
		tempJ = 0;
		tempI++;
	}
	return false;
}

function updateTile(tile) {
	updateQueue.push(tile);
}

function make2DArray(cols, rows) {
	let arr = new Array(cols);
	for (let i = 0; i < arr.length; i++) {
		arr[i] = new Array(rows);
	}
	return arr;
}

function xyToTile(x,y) {
	return ijToTile(floor(cols * (x/width)), floor(rows * (y/height)));
}

function ijToTile(i,j) {
	if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length) {return null;}
	return grid[i][j];
}

function mouseReleased() {
	let t = xyToTile(mouseX, mouseY)
	if (t === null) { return; }

	let asdf = 0;

	if (!started) {
		if (!fetching) {selectAndSetBoard(testString,t.i,t.j);}
		return;
	}

	switch(mouseButton) {

		case 'left':
			if (!t.flagged) { t.reveal(); }
			break;

		case 'right':
			t.toggleFlag();
			break;

		default: // mobile (i think)
			mobilePressed++;
			if (mobilePressed === 1) {
				mobileTarget = t;
			}
			// push();
			// fill(WHITE);
			// rect(0,0,80,80);
			// fill(C1);
			// textSize(50);
			// text(mobilePressed, 50, 50);
			// pop();
			break;
	}
}

function drawBomb(x, y, scale, padding=0) {
	const d = scale - padding;
	const cX = x + scale/2
	const cY = y + scale/2

	push();
	noStroke();
	fill(C1);
	circle(cX, cY, d * 0.8);
	triangle(
		cX, cY - d/2,
		cX + (sin(PI/3) * (d/2)), cY + (cos(PI/3) * (d/2)),
		cX - (sin(PI/3) * (d/2)), cY + (cos(PI/3) * (d/2))
		);
	triangle(
		cX, cY + d/2,
		cX + (sin(PI/3) * (d/2)), cY - (cos(PI/3) * (d/2)),
		cX - (sin(PI/3) * (d/2)), cY - (cos(PI/3) * (d/2))
		);

	fill(WHITE);
	circle(cX - d/8, cY - d/8, d * 0.25)
	pop();
}

function drawFlag(x, y, scale, padding=0) {
	const d = scale - padding;
	const cX = x + scale/2
	const cY = y + scale/2
	const shift = scale * 0.15;
	const poleWidth = scale * 0.15;

	const topY = y + shift;
	const tipX = x + shift;
	const tipY = (topY + cY) / 2;

	fill(WHITE);
	triangle(cX, topY, cX, cY, tipX, tipY);

	const x1 = cX - poleWidth/2 + poleWidth/2;
	const y1 = topY;
	const w1 = poleWidth;
	const h1 = scale - (2 * shift);

	fill(C1);
	rect(x1, y1, w1, h1);
	fill('rgba(255,255,255,0.2)');
	rect(x1, y1, w1/2, h1);

	// const x2 = tipX + shift + poleWidth/2;
	// const y2 = y + scale - (shift + poleWidth);
	// const w2 = scale - (4 * shift);
	// const h2 = poleWidth;

	// fill(C1);
	// rect(x2, y2, w2, h2);
	// fill('rgba(255,255,255,0.2)');
	// rect(x2, y2, w2, h2/2);
}

function drawTile(x,y,scale, padding=0, c_color=C3) {
	const d = scale - padding;
	const border = 0.8;
	const edge = (1 - border);

	push();
	noStroke();
	// Draw base
	fill(c_color);
	rect(x + padding/2,y + padding/2,d,d);
	// Draw highlights and shadows
	fill('rgba(255,255,255,0.5)');
	triangle(x + padding/2, y + padding/2, x + d + padding/2, y + padding/2, x + padding/2, y + d + padding/2);
	fill('rgba(0,0,0,0.5)');
	triangle(x + d + padding/2, y + d + padding/2, x + d + padding/2, y + padding/2, x + padding/2, y + d + padding/2);
	// Draw top
	fill(c_color);
	rect(x + padding/2 + (d*edge/2), y + padding/2 + (d*edge/2), d * border, d * border);
	pop();
}

function drawTileOnHover(x,y,scale, padding=0, color=C3) {
	const d = scale - padding;
	const border = 0.8;
	const edge = (1 - border);

	push();
	noStroke();
	// Draw base
	fill(color);
	rect(x + padding/2,y + padding/2,d,d);
	// Draw highlights and shadows
	fill('rgba(0,0,0,0.5)');
	triangle(x + padding/2, y + padding/2, x + d + padding/2, y + padding/2, x + padding/2, y + d + padding/2);
	fill('rgba(255,255,255,0.5)');
	triangle(x + d + padding/2, y + d + padding/2, x + d + padding/2, y + padding/2, x + padding/2, y + d + padding/2);
	// Draw top
	fill(color);
	rect(x + padding/2 + (d*edge/2), y + padding/2 + (d*edge/2), d * border, d * border);
	pop();
}