function resetGame() {
	if (resetting) {return;}
	
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			grid[i][j] = new Cell(i * size, j * size, i, j, size);
			updateTile(grid[i][j]);
		}
	}
	// setBombs();
	started = false;
	resetting = true;
	generateBoards(rows,cols,numBombs);
}

function setBombs() {
	// Set bombs
	let options = [];
	//*
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			options.push([i,j]);
		}
	}
	/*/
	const border = 1;
	for (let i = border; i < cols-border; i++) {
		for (let j = border; j < rows-border; j++) {
			options.push([i,j]);
		}
	}
	//*/

	for (let n = 0; n < numBombs; n++) {
		let index = floor(random(options.length))
		let choice = options[index];
		let i = choice[0];
		let j = choice[1];
		options.splice(index, 1);
		grid[i][j].bomb = true;
	}

	// Determine numbers
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			grid[i][j].count = countSurroundingBombs(i,j);
			grid[i][j].eCount = grid[i][j].count;
		}
	}
}

function setPredefinedBoard(board) {
	print(board)
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			console.log(i,j)
			if (board[j][i] === 0) {
				grid[i][j].bomb = false;
			} else {
				grid[i][j].bomb = true;
			}
		}
	}

	// Determine numbers
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			grid[i][j].count = countSurroundingBombs(i,j);
			grid[i][j].eCount = grid[i][j].count;
		}
	}
}

function countSurroundingBombs(ii,jj) {
	let count = 0;
	for (let i = ii - 1; i <= ii + 1; i++) {
		for (let j = jj - 1; j <= jj + 1; j++) {
			t = ijToTile(i,j);
			if (t != null && t.bomb) { count++; }
		}
	}
	return count;
}

function solveGame() {
	let notSame = true;

	while (notSame) {
		print('Going again!');
		notSame = tankField();
	}
}

function tankField() {
	let notSame = false;
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			if (grid[i][j].revealed && grid[i][j].count != 0) {
				if (flagObvious(i,j)) { notSame = true; }
			}
		}
	}
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			if (grid[i][j].revealed && grid[i][j].count != 0) {
				if (revealObvious(i,j)) { notSame = true; }
			}
		}
	}
	/* Temporary fix - makes it slower */
	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows; j++) {
			if (grid[i][j].revealed && grid[i][j].count != 0) {
				recalculateNeighborsCount(i,j);
			}
		}
	}
	return notSame;
}

function flagObvious(ii,jj) {
	let count = 0;
	let notSame = false;
	for (let i = ii - 1; i <= ii + 1; i++) {
		for (let j = jj - 1; j <= jj + 1; j++) {
			if (i === ii && j === jj) { continue; }
			t = ijToTile(i,j);
			if (t != null && !t.revealed && !t.flagged) { count++; }
		}
	}
	if (count == grid[ii][jj].eCount) {
		for (let i = ii - 1; i <= ii + 1; i++) {
			for (let j = jj - 1; j <= jj + 1; j++) {
				t = ijToTile(i,j);
				if (t != null && !t.revealed && !t.flagged) {
					t.flag();
					recalculateNeighborsCount(i,j);
					notSame = true;
				}
			}
		}
	}
	return notSame;
}

function revealObvious(ii,jj) {
	let t = ijToTile(ii,jj);
	let notSame = false;
	if (t.count === 0 || t.eCount != 0) { return false; }

	for (let i = ii - 1; i <= ii + 1; i++) {
		for (let j = jj - 1; j <= jj + 1; j++) {
			t = ijToTile(i,j);
			if (t != null && !t.revealed && !t.flagged) {
				t.reveal();
				recalculateNeighborsCount(i,j);
				notSame = true;
			}
		}
	}

	return notSame;
}

function recalculateNeighborsCount(ii,jj) {
	let t;
	for (let i = ii - 1; i <= ii + 1; i++) {
		for (let j = jj - 1; j <= jj + 1; j++) {
			t = ijToTile(i,j);
			if (t != null && t.revealed) {
				recalculateCount(i,j);
			}
		}
	}
}

function recalculateCount(ii,jj) {
	// print('Recalculating Count...')
	// print(ii,jj)
	let surroundingFlags = 0;
	for (let i = ii - 1; i <= ii + 1; i++) {
		for (let j = jj - 1; j <= jj + 1; j++) {
			if (i === ii && j === jj) { continue; }
			t = ijToTile(i,j);
			if (t != null && t.flagged) { surroundingFlags++; }
		}
	}
	// print(surroundingFlags);
	t = ijToTile(ii,jj)
	t.eCount = t.count - surroundingFlags;
	t.show();
}
