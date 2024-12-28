let wasmModule;

async function loadWasm() {
    wasmModule = await new Promise((resolve, reject) => {
        Module.onRuntimeInitialized = () => resolve(Module);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadWasm();

    const upload = document.getElementById("upload");
    const processButton = document.getElementById("process");
    const downloadLink = document.getElementById("download");
    const output = document.getElementById("output");

    let matrix = new Uint8Array();
    let size = 0;

    upload.addEventListener("change", async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const arrayBuffer = await file.arrayBuffer();
        const input = new Uint8Array(arrayBuffer);

        const matrixBuffer = new Uint8Array(256 * 256);
        const sizeBuffer = new Uint32Array(1);

        const parseResult = wasmModule.ccall(
            'parse_sudoku_file',
            'number',
            ['array', 'number', 'array', 'array'],
            [input, input.length, matrixBuffer, sizeBuffer]
        );

        if (parseResult < 0) {
            output.textContent = "Invalid Sudoku file.";
            return;
        }

        matrix = matrixBuffer.slice(0, sizeBuffer[0] * sizeBuffer[0]);
        size = sizeBuffer[0];
        output.textContent = `Parsed Matrix (${size}x${size}):\n${matrix}`;
    });

    processButton.addEventListener("click", () => {
        if (!matrix.length) {
            alert("Upload a valid Sudoku file first!");
            return;
        }

        wasmModule.ccall('process_matrix', null, ['array', 'number'], [matrix, size]);
        output.textContent = `Processed Matrix:\n${matrix}`;

        const outputBuffer = new Uint8Array(8 + size * size);
        const fileSize = wasmModule.ccall(
            'create_sudoku_file',
            'number',
            ['array', 'number', 'array', 'number'],
            [outputBuffer, outputBuffer.length, matrix, size]
        );

        const blob = new Blob([outputBuffer.slice(0, fileSize)], { type: "application/octet-stream" });
        downloadLink.href = URL.createObjectURL(blob);
    });
});
