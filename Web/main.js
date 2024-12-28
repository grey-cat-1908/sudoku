let wasmExports;

async function loadWasmModule() {
    const response = await fetch('sudoku.wasm');
    const buffer = await response.arrayBuffer();
    const wasmModule = await WebAssembly.instantiate(buffer, {
        env: {
            printf: (ptr, ...args) => console.log("WASM printf stub")
        }
    });
    wasmExports = wasmModule.instance.exports;
}

function handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = () => {
        const arrayBuffer = reader.result;
        const inputBuffer = new Uint8Array(arrayBuffer);
        const output = wasmExports.read_sudoku_buffer(inputBuffer, inputBuffer.length);
        document.getElementById('output').innerText = `Sudoku Parsed: \n${output}`;
    };
    reader.readAsArrayBuffer(file);
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

    const inputBuffer = new Uint8Array(256);
    const flatMatrix = predefinedMatrix.flat();
    wasmExports.write_sudoku_buffer(size, flatMatrix, inputBuffer);

    const blob = new Blob([inputBuffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'example.sudoku';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadWasmModule();
    document.getElementById('uploadButton').addEventListener('click', () => {
        const file = document.getElementById('fileInput').files[0];
        if (file) handleFileUpload(file);
    });
    document.getElementById('downloadButton').addEventListener('click', downloadExampleFile);
});
