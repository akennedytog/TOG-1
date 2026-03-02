// Carousel Logic
let currentIndex = 0;
const items = document.querySelectorAll('.carousel-item');
const total = items.length;

const showItem = index => {
  items.forEach((item, i) => item.classList.toggle('active', i === index));
};

document.getElementById('next').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % total;
  showItem(currentIndex);
});
document.getElementById('prev').addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + total) % total;
  showItem(currentIndex);
});
// Auto-rotate
setInterval(() => {
  currentIndex = (currentIndex + 1) % total;
  showItem(currentIndex);
}, 5000);

// FAQ Accordion Logic
const headers = document.querySelectorAll('.accordion-header');
headers.forEach(header => {
  header.addEventListener('click', () => {
    const content = header.nextElementSibling;
    const isOpen = content.style.display === 'block';
    content.style.display = isOpen ? 'none' : 'block';
  });
});
