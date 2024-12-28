#include <stdlib.h>
#include <string.h>
#include <stdint.h>

#define MAX_SIZE 256

void validate_matrix(uint8_t *matrix, int size) {
    for (int i = 0; i < size * size; i++) {
        if (matrix[i] > size) {
            matrix[i] = 0;
        }
    }
}

void process_matrix(uint8_t *matrix, int size) {
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
            matrix[i * size + j] = (matrix[i * size + j] + 1) % (size + 1);
        }
    }
}

int parse_sudoku_file(const uint8_t *input, int input_size, uint8_t *matrix, int *size) {
    if (input_size < 8 || input[0] != 0x81 || memcmp(input + 1, "SUDOKU", 6) != 0) {
        return -1;
    }
    *size = input[7];
    if (*size <= 0 || *size > MAX_SIZE || input_size != 8 + (*size) * (*size)) {
        return -1;
    }
    memcpy(matrix, input + 8, (*size) * (*size));
    return 0;
}

int create_sudoku_file(uint8_t *output, int max_output_size, const uint8_t *matrix, int size) {
    if (size <= 0 || size > MAX_SIZE || max_output_size < 8 + size * size) {
        return -1;
    }
    output[0] = 0x81;
    memcpy(output + 1, "SUDOKU", 6);
    output[7] = size;
    memcpy(output + 8, matrix, size * size);
    return 8 + size * size;
}
