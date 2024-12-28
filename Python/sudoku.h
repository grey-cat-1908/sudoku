#ifndef SUDOKU_H
#define SUDOKU_H

#include <Python.h>

PyObject *write_sudoku_file(PyObject *self, PyObject *args);
PyObject *read_sudoku_file(PyObject *self, PyObject *args);

#endif // SUDOKU_H
