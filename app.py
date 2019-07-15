from flask import Flask, request, redirect, render_template
from minesweeper import generate_board, generate_counts, find_solvable_board, display
import os, time, json
import numpy as np

TOTAL = 2000 # TODO: determine dynamically

app = Flask(__name__)

@app.route("/", methods=['GET', 'POST'])
def home():
	return render_template('index.html')

@app.route("/hello", methods=['POST'])
def hello():
	return {"hello" : "goodbye"}

@app.route("/generate", methods=['POST'])
def generate():
	print(request.json)
	h = request.json['height']
	w = request.json['width']
	b = request.json['bombs']
	boards = [generate_board([h, w], b).tolist() for _ in range(TOTAL)]
	return json.dumps(boards)

@app.route("/select", methods=['POST'])
def select():
	boards = [np.array(b) for b in request.json['boards']]
	start_j = request.json['start_i']
	start_i = request.json['start_j']
	print("i:", start_i, "j:", start_j)

	counts = [generate_counts(board) for board in boards]

	start_time = time.time()
	board = find_solvable_board(boards=boards, counts=counts, start=[start_i, start_j])
	duration = time.time() - start_time

	display(board)

	return json.dumps({'board': board.tolist()})

# @app.route("/fouriscosmic", methods=['POST'])
# def four_is_cosmic_handler():
# 	number = request.form['cosmic_number']
# 	print(number)
# 	print(request)
# 	cosmic_string = cosmic(int(number))
# 	return render_template('home.html', cosmic_string = cosmic_string)


if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)