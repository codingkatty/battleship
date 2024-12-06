document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("identicon");
  const ctx = canvas.getContext("2d");
  const colorInput = document.getElementById("color");
  const bgColorInput = document.getElementById("bgColor");
  const generateButton = document.getElementById("generate");
  const downloadButton = document.getElementById("download");

  colorInput.value = "#8B4513";
  bgColorInput.value = "#F5DEB3";

  function generateIdenticon(color, bgColor) {
    const size = 7;
    const patternSize = 5;
    const cellSize = canvas.width / size;
    const pattern = [];

    // Calculate middle for symmetry
    const middleCol = Math.floor(patternSize / 2);

    // Generate pattern with symmetry
    for (let i = 0; i < patternSize; i++) {
      pattern[i] = [];
      // Only generate up to middle column
      for (let j = 0; j <= middleCol; j++) {
        pattern[i][j] = Math.random() > 0.5;
        // Mirror the pattern for symmetry
        if (j !== middleCol) {
          // Skip mirroring middle column
          pattern[i][patternSize - 1 - j] = pattern[i][j];
        }
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < patternSize; i++) {
      for (let j = 0; j < patternSize; j++) {
        ctx.fillStyle = pattern[i][j] ? color : bgColor;
        ctx.fillRect(
          (j + 1) * cellSize,
          (i + 1) * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }

  generateButton.addEventListener("click", () => {
    const color = colorInput.value;
    const bgColor = bgColorInput.value;
    generateIdenticon(color, bgColor);
  });

  downloadButton.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "identicon.png";
    link.href = canvas.toDataURL();
    link.click();
  });

  generateIdenticon(colorInput.value, bgColorInput.value);

  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  document.getElementById("share").addEventListener("click", () => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        alert("Failed to generate image blob.");
        return;
      }

      console.log("Blob Type:", blob.type);

      const formData = new FormData();
      const uuid = generateUUID();
      const filename = `identicon-${uuid}.png`;

      formData.append("file", blob, filename);

      try {
        const response = await axios.post(
          "https://piratepicgen.onrender.com/upload",
          formData
        );

        if (response.status === 200) {
          alert("Image shared to gallery!");
        } else {
          alert(`Failed to share image. Status Code: ${response.status}`);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to share image.");
      }
    }, "image/png");
  });
});
