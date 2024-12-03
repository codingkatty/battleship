document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('identicon');
    const ctx = canvas.getContext('2d');
    const colorInput = document.getElementById('color');
    const bgColorInput = document.getElementById('bgColor');
    const generateButton = document.getElementById('generate');
    const downloadButton = document.getElementById('download');

    colorInput.value = '#8B4513';
    bgColorInput.value = '#F5DEB3';

    function generateIdenticon(color, bgColor) {
        const size = 7;
        const patternSize = 5;
        const cellSize = canvas.width / size;
        const pattern = [];

        for (let i = 0; i < patternSize; i++) {
            pattern[i] = [];
            for (let j = 0; j < patternSize; j++) {
                pattern[i][j] = Math.random() > 0.5;
            }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < patternSize; i++) {
            for (let j = 0; j < patternSize; j++) {
                ctx.fillStyle = pattern[i][j] ? color : bgColor;
                ctx.fillRect((j + 1) * cellSize, (i + 1) * cellSize, cellSize, cellSize);
            }
        }
    }

    generateButton.addEventListener('click', () => {
        const color = colorInput.value;
        const bgColor = bgColorInput.value;
        generateIdenticon(color, bgColor);
    });

    downloadButton.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'identicon.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    generateIdenticon(colorInput.value, bgColorInput.value);
});