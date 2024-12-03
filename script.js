document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('identicon');
    const ctx = canvas.getContext('2d');
    const colorInput = document.getElementById('color');
    const generateButton = document.getElementById('generate');

    function generateIdenticon(color) {
        const size = 6; // 6x6 grid
        const cellSize = canvas.width / size;
        const pattern = [];

        // Generate a random pattern
        for (let i = 0; i < size; i++) {
            pattern[i] = [];
            for (let j = 0; j < size; j++) {
                pattern[i][j] = Math.random() > 0.5;
            }
        }

        // Draw the pattern on the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                ctx.fillStyle = pattern[i][j] ? color : '#FFFFFF';
                ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            }
        }
    }

    generateButton.addEventListener('click', () => {
        const color = colorInput.value;
        generateIdenticon(color);
    });

    // Generate an initial Identicon
    generateIdenticon(colorInput.value);
});