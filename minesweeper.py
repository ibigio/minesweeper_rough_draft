import scipy, time
from scipy import signal
import numpy as np

DEBUG = True

def debug(*args):
	if DEBUG:
		print(args)

def is_out(A, i, j):
	return i < 0 or j < 0 or i >= len(A) or j >= len(A[0])

def generate_board(size=[10,10], bombs=10):
	board = np.zeros([size[0], size[1]])
	all_indices = []
	for i in range(size[0]):
		for j in range(size[1]):
			all_indices.append((i,j))
	bomb_indices = np.random.choice(range(len(all_indices)), bombs)
	for index in bomb_indices:
		coord = all_indices[index]
		board[coord[0]][coord[1]] = 1
	return board

def generate_counts(board):
	k = [
	[1,1,1],
	[1,0,1],
	[1,1,1]]
	return signal.convolve2d(board, k, mode='same')

def expand_all_uncovered(counts, knowledge_mask):

	def uncover(ii,jj):

		knowledge_mask[ii][jj] = 1

		if counts[ii][jj] == 0:
			# If 0, unvover all neighbors
			for i in range(ii-1,ii+2):
				for j in range(jj-1,jj+2):
					if is_out(counts, i,j):
						continue
					if knowledge_mask[i][j] == 0:
						uncover(i,j)

	for i in range(len(counts)):
		for j in range(len(counts[0])):
			if knowledge_mask[i][j] == 1 and counts[i][j] == 0:
				uncover(i,j)


def flag_obvious(counts, knowledge_mask, flags):
	tile_counts = generate_counts(1 - knowledge_mask)
	flag_counts = generate_counts(flags)
	to_flag_around = (counts == tile_counts) & (knowledge_mask == 1) # only flag around uncovered tiles
	to_flag = generate_counts(to_flag_around) > 0
	to_flag &= (knowledge_mask == 0) # only flag covered tiles
	to_flag &= (flags == 0)

	flags[to_flag] = 1

	return np.any(to_flag)


def uncover_obvious(counts, knowledge_mask, flags):
	tile_counts = generate_counts(1 - knowledge_mask)
	flag_counts = generate_counts(flags)
	to_uncover_around = (counts <= flag_counts) & (knowledge_mask == 1) # only uncover around uncovered tiles
	to_uncover = generate_counts(to_uncover_around) > 0
	to_uncover &= (flags == 0) # only uncover non-flagged tiles
	to_uncover &= (knowledge_mask == 0)

	knowledge_mask[to_uncover] = 1

	return np.any(to_uncover)


def solve_board(counts, knowledge_mask=None, start=[0,0], debug=False):
	if knowledge_mask is None:
		knowledge_mask = np.zeros(np.shape(counts))
		knowledge_mask[start[0]][start[1]] = 1

	flags = np.zeros(np.shape(counts))
	progressing = True
	while progressing:
		progressing = flag_obvious(counts, knowledge_mask, flags)
		if debug:
			print_board(counts, knowledge_mask, flags, 'flagged')

		progressing |= uncover_obvious(counts, knowledge_mask, flags)
		expand_all_uncovered(counts, knowledge_mask)
		if debug:
			print_board(counts, knowledge_mask, flags, 'uncovered')

	return flags

def solvable(counts, board, knowledge_mask=None, start=[0,0]):
	return np.all(solve_board(counts, knowledge_mask, start) == board)


def generate_and_solve_board(size=[10,10], bombs=10, start=[0,0]):
	board = generate_board(size, bombs)
	counts = generate_counts(board)
	flags = solve_board(counts, start=start)
	return (np.all(flags == board), board)

def find_solvable_board(size=[10,10], bombs=10, start=[0,0], search_limit=None, timeout=None, boards=None, counts=None):
	if counts != None and boards is None:
		raise Exception('counts provided without a board')
	if boards is None or counts is None:
		# if search_limit is None:
		# 	raise Exception('must provide ')
		# boards = [generate_board(size, bombs) for _ in range(search_limit)]
		# counts = [generate_counts(board) for board in boards]
		raise Exception('please provide a board and counts for speed :)')

	for (board, count, i) in zip(boards, counts, range(len(boards))):
		if solvable(count, board, start=start):
			solve_board(count, start=start, debug=True)
			# display(board,str(i))
			return board



def display(board, title=None, print_flush=False, pretty=True, frame=True):
	FRAME_SYMBOL = '=='

	if title != None:
		print(title)

	if frame:
		print(FRAME_SYMBOL * len(board[0]))

	for row in board:
		if pretty:
			str_row = ' '.join([str(symbol_of(e)) for e in row])
			print(str_row)
		else:
			print(row)

	if frame:
		print(FRAME_SYMBOL * len(board[0]))

	if not print_flush:
		print()

def symbol_of(num):
	if num == 0:
		return ' '
	if num == -1:
		return 'O'
	if num == -2:
		return '-'
	if num == -3:
		return 'O'
	if isinstance(num, str):
		return num
	return str(int(num))

def print_board(counts, knowledge_mask, flags, title=None):
	full = np.zeros(np.shape(counts))
	full -= 2
	full[(knowledge_mask == 1)] = counts[(knowledge_mask == 1)]
	full[(flags == 1)] = -1

	pretty = [[symbol_of(elt) for elt in row] for row in full]

	display(pretty, title)
	



# display((1-b1) - 3, 'board')



# display((1-f1) - 3, 'final flags')
# display((1-b1) - 3, 'board')

# # count = 0
# total = 2000
# # for i in range(total):
# # 	(solvable, board) = generate_and_solve_board([16,30], 99)
# # 	if solvable:
# # 		display(board)
# # 		print(i)
# # 		break
# # 	if i % 100 == 0:
# # 		print(i)

# durations = []

# for i in range(10):
# 	# Generate boards
# 	start_time = time.time()

# 	boards = [generate_board([16,30], 99) for _ in range(total)]
# 	counts = [generate_counts(board) for board in boards]
# 	duration = time.time() - start_time

# 	print(f"Generated boards in {duration} seconds.")

# 	# Solved boards
# 	start_time = time.time()

# 	find_solvable_board(boards=boards, counts=counts)

# 	duration = time.time() - start_time
# 	durations.append(duration)
# 	print(f"Found solvable board in {duration} seconds.")

# print(np.mean(durations))
