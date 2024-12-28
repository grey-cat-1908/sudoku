import sudoku

board = [
    [0, 0, 9, 0, 5, 0, 0, 0, 0],
    [5, 3, 0, 0, 8, 4, 0, 2, 0],
    [0, 0, 0, 0, 6, 0, 0, 0, 0],
    [4, 0, 6, 0, 3, 0, 0, 0, 0],
    [0, 1, 8, 0, 0, 0, 0, 0, 9],
    [0, 0, 0, 0, 0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 5, 0],
    [0, 8, 0, 0, 0, 0, 7, 0, 0],
    [0, 0, 0, 5, 6, 1, 9, 0, 0]
]

sudoku.write_sudoku_file('example.sudoku', 9, board)