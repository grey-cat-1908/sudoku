let wasmModule;

async function loadWasmModule() {
    const moduleFactory = await import('./sudoku.js');
    wasmModule = await moduleFactory.default();
}

function downloadExampleFile() {
    const size = 9;
    const predefinedMatrix = [
        [0, 0, 9, 0, 5, 0, 0, 0, 0],
        [5, 3, 0, 0, 8, 4, 0, 2, 0],
        [0, 0, 0, 0, 6, 0, 0, 0, 0],
        [4, 0, 6, 0, 3, 0, 0, 0, 0],
        [0, 1, 8, 0, 0, 0, 0, 0, 9],
        [0, 0, 0, 0, 0, 0, 2, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 5, 0],
        [0, 8, 0, 0, 0, 0, 7, 0, 0],
        [0, 0, 0, 5, 6, 1, 9, 0, 0]
    ];

    const flatMatrix = predefinedMatrix.flat();
    const matrixPtr = wasmModule._malloc(flatMatrix.length);
    wasmModule.HEAPU8.set(flatMatrix, matrixPtr);

    const bufferPtr = wasmModule._malloc(256);
    wasmModule._write_sudoku_buffer(size, matrixPtr, bufferPtr);

    const outputBuffer = new Uint8Array(wasmModule.HEAPU8.subarray(bufferPtr, bufferPtr + 256));
    wasmModule._free(matrixPtr);
    wasmModule._free(bufferPtr);

    const blob = new Blob([outputBuffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'example.sudoku';
    link.click();
}

function handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = () => {
        const inputBuffer = new Uint8Array(reader.result);
        const bufferPtr = wasmModule._malloc(inputBuffer.length);
        wasmModule.HEAPU8.set(inputBuffer, bufferPtr);

        wasmModule._read_sudoku_buffer(bufferPtr, inputBuffer.length);
        wasmModule._free(bufferPtr);
    };
    reader.readAsArrayBuffer(file);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadWasmModule();

    document.getElementById('uploadButton').addEventListener('click', () => {
        const file = document.getElementById('fileInput').files[0];
        if (file) handleFileUpload(file);
    });

    document.getElementById('downloadButton').addEventListener('click', downloadExampleFile);
});