
let possibleBoards = [];
let testString;

function post(url, params, callback) {
	const r = new XMLHttpRequest();
	r.open('POST', url);
	r.setRequestHeader('Content-Type', 'application/json');
	r.onload = () => callback(r);
	r.send(params);
}

function generateBoards(height,width,bombs) {
	post('generate',
		JSON.stringify({
			height: height,
			width: width,
			bombs: bombs
		}),
		r => {
			alert("Boards have been generated.");
			testString = JSON.parse(r.response);
	});
}

function selectAndSetBoard(boards,start_i,start_j) {
	fetching = true;
	post('select',
		JSON.stringify({
			boards: boards,
			start_i: start_i,
			start_j: start_j
		}),
		r => {
			alert("Board has been selected and set.");
			let board = JSON.parse(r.response).board;
			print(board)
			setPredefinedBoard(board);
			ijToTile(start_i,start_j).reveal();
			fetching = false;
			started = true;
			resetting = false;

		})
}