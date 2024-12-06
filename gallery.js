document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('https://piratepicgen.onrender.com/load');
    const urls = await response.json();

    const container = document.querySelector('.container');
    urls.forEach(url => {
        if (url) {
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Identicon';
            img.classList.add('gallery-img');
            container.appendChild(img);
        }
    });
});