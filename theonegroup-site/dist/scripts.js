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

// Beta Form Handling
document.getElementById('beta-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  // Store in localStorage for now (will be replaced with API call)
  const submissions = JSON.parse(localStorage.getItem('betaSubmissions') || '[]');
  submissions.push({ ...data, submittedAt: new Date().toISOString() });
  localStorage.setItem('betaSubmissions', JSON.stringify(submissions));
  
  // Show success message
  e.target.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h3 style="color: var(--accent); margin-bottom: 10px;">✅ Application Received!</h3>
      <p>Thanks for applying, ${data.name}. We'll review your application and reach out within 48 hours.</p>
      <p style="font-size: 14px; color: var(--muted); margin-top: 15px;">Follow us on <a href="https://x.com/TheOneGroupAI" target="_blank">@TheOneGroupAI</a> for updates.</p>
    </div>
  `;
});

// Newsletter Form Handling
document.getElementById('newsletter-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const email = formData.get('email');
  
  // Store in localStorage for now
  const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
  subscribers.push({ email, subscribedAt: new Date().toISOString() });
  localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
  
  // Show success message
  e.target.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h3 style="color: var(--accent); margin-bottom: 10px;">✅ You're Subscribed!</h3>
      <p>Welcome to AI Trends Weekly. First issue coming this Saturday.</p>
      <p style="font-size: 14px; color: var(--muted); margin-top: 15px;">Check your inbox for a confirmation.</p>
    </div>
  `;
});
