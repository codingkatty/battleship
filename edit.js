document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("identicon");
    const ctx = canvas.getContext("2d");
    const colorInput = document.getElementById("color");
    const bgColorInput = document.getElementById("bgColor");
    const drawButton = document.getElementById("draw");
    const eraseButton = document.getElementById("erase");
    const uploadButton = document.getElementById("share");
    const exportButton = document.getElementById("export");
    const saveButton = document.getElementById('save');
    const loadButton = document.getElementById('load');
    const fileInput = document.getElementById('fileInput');

    let drawing = false;
    let mode = 'draw';
    let lastX = -1;
    let lastY = -1;
    let currentSize = 5;

    colorInput.value = "#8B4513";
    bgColorInput.value = "#F5DEB3";

    function createDefaultPattern() {
        const pattern = Array(5).fill().map(() => Array(5).fill(false));
        
        pattern[1][1] = true;
        pattern[1][3] = true;
        pattern[2][2] = true;
        pattern[3][1] = true;
        pattern[3][2] = true;
        pattern[3][3] = true;
        
        return pattern;
    }

    let currentPattern = createDefaultPattern();
    generateIdenticon(colorInput.value, bgColorInput.value, currentPattern);

    setMode('draw');

    canvas.addEventListener('pointerdown', startDrawing);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', stopDrawing);
    canvas.addEventListener('pointerout', stopDrawing);

    canvas.addEventListener('touchstart', e => e.preventDefault());
    canvas.addEventListener('touchmove', e => e.preventDefault());

    function startDrawing(e) {
        drawing = true;
        draw(e);
    }

    function stopDrawing() {
        drawing = false;
        lastX = -1;
        lastY = -1;
    }

    function draw(e) {
        if (!drawing) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const fullSize = currentSize + 2;
        const x = Math.floor(((e.clientX - rect.left) * scaleX) / (canvas.width / fullSize));
        const y = Math.floor(((e.clientY - rect.top) * scaleY) / (canvas.height / fullSize));

        if (x < 1 || x > currentSize || y < 1 || y > currentSize) return;

        if (x !== lastX || y !== lastY) {
            updateCell(x - 1, y - 1);
            lastX = x;
            lastY = y;
        }
    }

    function updateCell(x, y) {
        if (x < 0 || x >= currentSize || y < 0 || y >= currentSize) return;

        const value = mode === 'draw';
        currentPattern[y][x] = value;
        currentPattern[y][currentSize - 1 - x] = value;
        
        generateIdenticon(colorInput.value, bgColorInput.value, currentPattern);
    }

    colorInput.addEventListener('change', () => {
        generateIdenticon(colorInput.value, bgColorInput.value, currentPattern);
    });

    bgColorInput.addEventListener('change', () => {
        generateIdenticon(colorInput.value, bgColorInput.value, currentPattern);
    });

    drawButton.addEventListener('click', () => setMode('draw'));
    eraseButton.addEventListener('click', () => setMode('erase'));

    function setMode(newMode) {
        mode = newMode;
        drawButton.classList.toggle('active', mode === 'draw');
        eraseButton.classList.toggle('active', mode === 'erase');
        canvas.style.cursor = mode === 'draw' ? 'crosshair' : 'not-allowed';
    }

    exportButton.addEventListener('click', () => {
        const link = document.createElement("a");
        link.download = "edited_identicon.png";
        link.href = canvas.toDataURL();
        link.click();
    });

    uploadButton.addEventListener('click', () => {
        canvas.toBlob(async (blob) => {
            if (!blob) {
                alert("Failed to generate image blob.");
                return;
            }

            const formData = new FormData();
            const uuid = generateUUID();
            const filename = `edited-identicon-${uuid}.png`;

            formData.append("file", blob, filename);

            try {
                const response = await axios.post(
                    "https://piratepicgen.onrender.com/upload",
                    formData
                );

                if (response.status === 200) {
                    alert("Image uploaded to gallery!");
                } else {
                    alert(`Failed to upload image. Status Code: ${response.status}`);
                }
            } catch (error) {
                console.error("Error uploading file:", error);
                alert("Failed to upload image.");
            }
        }, "image/png");
    });

    const sizeModal = document.getElementById('sizeModal');
    const sizeBtn = document.getElementById('size');
    const sizeOptions = document.querySelectorAll('.size-options button');

    sizeBtn.addEventListener('click', () => {
        sizeModal.style.display = 'block';
    });

    sizeModal.addEventListener('click', (e) => {
        if (e.target === sizeModal) {
            sizeModal.style.display = 'none';
        }
    });

    sizeOptions.forEach(button => {
        button.addEventListener('click', () => {
            const newSize = parseInt(button.dataset.size);
            if (newSize !== currentSize) {
                currentSize = newSize;
                currentPattern = Array(currentSize).fill().map(() => Array(currentSize).fill(false));
                generateIdenticon(colorInput.value, bgColorInput.value, currentPattern);
            }
            sizeOptions.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            sizeModal.style.display = 'none';
        });
    });

    function generateIdenticon(color, bgColor, gridData) {
        const borderSize = 1;
        const fullSize = currentSize + (borderSize * 2);
        const cellSize = canvas.width / fullSize;
        const pattern = gridData || createDefaultPattern();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < currentSize; i++) {
            for (let j = 0; j < currentSize; j++) {
                ctx.fillStyle = pattern[i][j] ? color : bgColor;
                ctx.fillRect(
                    (j + borderSize) * cellSize,
                    (i + borderSize) * cellSize,
                    cellSize,
                    cellSize
                );
            }
        }
    }

    function generateUUID() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
            const r = (Math.random() * 16) | 0,
                  v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }

    saveButton.addEventListener('click', () => {
        console.log("Download");
        const data = {
            size: currentSize,
            colors: [colorInput.value, bgColorInput.value],
            grid: currentPattern.map(row => 
                row.map(cell => cell ? '1' : '0').join('')
            )
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'identicon.piratemark';
        link.click();
    });

    loadButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.size || !Array.isArray(data.colors) || !Array.isArray(data.grid)) {
                throw new Error('Invalid file format');
            }

            currentSize = data.size;
            sizeOptions.forEach(btn => {
                btn.classList.toggle('active', parseInt(btn.dataset.size) === currentSize);
            });

            colorInput.value = data.colors[0];
            bgColorInput.value = data.colors[1];

            currentPattern = data.grid.map(row => 
                row.split('').map(cell => cell === '1')
            );

            generateIdenticon(colorInput.value, bgColorInput.value, currentPattern);
        } catch (error) {
            console.error('Error loading file:', error);
            alert('Invalid file format');
        }

        fileInput.value = '';
    });

    currentPattern = createDefaultPattern();
    generateIdenticon(colorInput.value, bgColorInput.value, currentPattern);
});