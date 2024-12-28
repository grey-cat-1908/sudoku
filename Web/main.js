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

const size = 9;

async function loadWasmModule() {
    const wasmModule = await WebAssembly.instantiateStreaming(fetch('sudoku.wasm'), {
        env: {
            printf: (ptr, ...args) => console.log(UTF8ToString(ptr, ...args)),
        },
    });
    return wasmModule.instance.exports;
}

async function handleFileUpload(file) {
    const wasmExports = await loadWasmModule();
    const reader = new FileReader();
    reader.onload = () => {
        const buffer = new Uint8Array(reader.result);
        wasmExports.read_sudoku_buffer(buffer, buffer.length);
    };
    reader.readAsArrayBuffer(file);
}

function downloadExampleFile() {
    const wasmExports = loadWasmModule();
    const buffer = new Uint8Array(256);
    const matrix = predefinedMatrix.flat();
    const size = 9;

    // Write buffer
    wasmExports.write_sudoku_buffer(size, matrix, buffer);

    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'example.sudoku';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

document.getElementById('uploadButton').addEventListener('click', () => {
    const file = document.getElementById('fileInput').files[0];
    if (file) handleFileUpload(file);
});

document.getElementById('downloadButton').addEventListener('click', downloadExampleFile);
