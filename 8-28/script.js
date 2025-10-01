// Carousel
const track = document.querySelector('.carousel-track');
const slides = document.querySelectorAll('.carousel-track img');
let index = 0;

function updateCarousel() {
    track.style.transform = `translateX(-${index * 100}%)`;
}

document.querySelector('.next').addEventListener('click', () => {
    index = (index + 1) % slides.length;
    updateCarousel();
});

document.querySelector('.prev').addEventListener('click', () => {
    index = (index - 1 + slides.length) % slides.length;
    updateCarousel();
});

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.querySelector('.close');

document.querySelectorAll('.carousel img, .masonry-grid img').forEach(img => {
    img.addEventListener('click', () => {
        lightbox.style.display = 'flex';
        lightboxImg.src = img.src;
    });
});

closeBtn.addEventListener('click', () => {
    lightbox.style.display = 'none';
});

lightbox.addEventListener('click', (e) => {
    if (e.target !== lightboxImg) {
        lightbox.style.display = 'none';
    }
});
