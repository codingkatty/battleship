document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('https://piratepicgen.onrender.com/load');
        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const urls = await response.json();
        const container = document.querySelector('.container');

        urls.forEach(url => {
            if (url) {
                const img = document.createElement('img');
                img.src = url;
                img.alt = 'Identicon';
                img.classList.add('gallery-img');

                img.onerror = () => {
                    console.error(`Failed to load image at URL: ${url}`);
                };

                container.appendChild(img);
            } else {
                console.warn('Encountered a null or undefined URL:', url);
            }
        });
    } catch (error) {
        console.error('Error loading gallery:', error);
        alert('Failed to load gallery. Please try again later.');
    }
});