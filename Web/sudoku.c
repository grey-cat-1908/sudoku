#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void write_sudoku_buffer(int size, char **matrix, unsigned char *buffer) {
    int offset = 0;
    buffer[offset++] = 0x81;
    const char *header = "SUDOKU";
    memcpy(buffer + offset, header, 6);
    offset += 6;
    buffer[offset++] = size;

    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
            buffer[offset++] = matrix[i][j];
        }
    }
}

int read_sudoku_buffer(unsigned char *buffer, int buffer_size) {
    int offset = 0;
    if (buffer[offset++] != 0x81) {
        fprintf(stderr, "Invalid buffer format: First byte is not 0x81.\n");
        return -1;
    }

    char header[7] = {0};
    memcpy(header, buffer + offset, 6);
    offset += 6;
    if (strncmp(header, "SUDOKU", 6) != 0) {
        fprintf(stderr, "Invalid buffer format: Header is not 'SUDOKU'.\n");
        return -1;
    }

    int size = buffer[offset++];
    if (size <= 0 || size * size + offset > buffer_size) {
        fprintf(stderr, "Invalid size in buffer or buffer too small.\n");
        return -1;
    }

    printf("Sudoku (size %d x %d):\n", size, size);
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
            printf("%d ", buffer[offset++]);
        }
        printf("\n");
    }

    return 0;
}
