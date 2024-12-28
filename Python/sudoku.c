#include "sudoku.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static PyObject *write_sudoku_file(PyObject *self, PyObject *args) {
    const char *filepath;
    int size;
    PyObject *board_obj;

    if (!PyArg_ParseTuple(args, "siO", &filepath, &size, &board_obj)) {
        return NULL;
    }

    FILE *file = fopen(filepath, "wb");
    if (!file) {
        PyErr_SetString(PyExc_IOError, "Failed to open file for writing.");
        return NULL;
    }

    fputc(0x81, file);
    const char *header = "SUDOKU";
    fwrite(header, 1, 6, file);

    fputc(size, file);

    for (int i = 0; i < size; i++) {
        PyObject *row = PyList_GetItem(board_obj, i);
        if (!PyList_Check(row)) {
            fclose(file);
            PyErr_SetString(PyExc_TypeError, "Board must be a list of lists.");
            return NULL;
        }

        for (int j = 0; j < size; j++) {
            int value = (int)PyLong_AsLong(PyList_GetItem(row, j));
            fputc(value, file);
        }
    }

    fclose(file);
    Py_RETURN_NONE;
}

static PyObject *read_sudoku_file(PyObject *self, PyObject *args) {
    const char *filepath;

    if (!PyArg_ParseTuple(args, "s", &filepath)) {
        return NULL;
    }

    FILE *file = fopen(filepath, "rb");
    if (!file) {
        PyErr_SetString(PyExc_IOError, "Failed to open file for reading.");
        return NULL;
    }

    if (fgetc(file) != 0x81) {
        fclose(file);
        PyErr_SetString(PyExc_ValueError, "Invalid file format: First byte is not 0x81.");
        return NULL;
    }

    char header[7] = {0};
    fread(header, 1, 6, file);
    if (strcmp(header, "SUDOKU") != 0) {
        fclose(file);
        PyErr_SetString(PyExc_ValueError, "Invalid file format: Header is not 'SUDOKU'.");
        return NULL;
    }

    int size = fgetc(file);
    if (size <= 0) {
        fclose(file);
        PyErr_SetString(PyExc_ValueError, "Invalid size in file.");
        return NULL;
    }

    PyObject *board = PyList_New(size);
    for (int i = 0; i < size; i++) {
        PyObject *row = PyList_New(size);
        for (int j = 0; j < size; j++) {
            int value = fgetc(file);
            if (value == EOF) {
                fclose(file);
                Py_DECREF(board);
                PyErr_SetString(PyExc_ValueError, "Unexpected end of file.");
                return NULL;
            }
            PyList_SetItem(row, j, PyLong_FromLong(value));
        }
        PyList_SetItem(board, i, row);
    }

    fclose(file);
    return board;
}

static PyMethodDef SudokuMethods[] = {
    {"write_sudoku_file", write_sudoku_file, METH_VARARGS, "Write a Sudoku board to a file."},
    {"read_sudoku_file", read_sudoku_file, METH_VARARGS, "Read a Sudoku board from a file."},
    {NULL, NULL, 0, NULL}
};

static struct PyModuleDef sudokumodule = {
    PyModuleDef_HEAD_INIT,
    "sudoku",
    "Sudoku file handling module.",
    -1,
    SudokuMethods
};

PyMODINIT_FUNC PyInit_sudoku(void) {
    return PyModule_Create(&sudokumodule);
}
