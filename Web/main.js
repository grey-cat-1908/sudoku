let wasmModule;

async function loadWasmModule() {
    const SudokuModule = await fetch('sudoku.js').then(res => res.text());
    const ModuleFactory = new Function(`${SudokuModule}; return Module;`);
    const Module = ModuleFactory();
    wasmModule = await Module();
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

    const buffer = new Uint8Array(256);
    const flatMatrix = predefinedMatrix.flat();
    const matrixPtr = wasmModule._malloc(flatMatrix.length);

    wasmModule.HEAPU8.set(flatMatrix, matrixPtr);
    wasmModule._write_sudoku_buffer(size, matrixPtr, buffer.byteOffset);
    wasmModule._free(matrixPtr);

    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'example.sudoku';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = () => {
        const arrayBuffer = reader.result;
        const inputBuffer = new Uint8Array(arrayBuffer);
        wasmModule._read_sudoku_buffer(inputBuffer.byteOffset, inputBuffer.length);
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
