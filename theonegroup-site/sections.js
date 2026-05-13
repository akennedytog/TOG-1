/**
 * Section Navigation & Smooth Scrolling
 * Makes internal anchor links work smoothly
 */

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Highlight active section in nav
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a[href^="#"]');

function highlightNav() {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (scrollY >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('text-primary-600', 'dark:text-primary-400');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('text-primary-600', 'dark:text-primary-400');
    }
  });
}

window.addEventListener('scroll', highlightNav);

// Form submission handling - Allow Formspree to work
const forms = document.querySelectorAll('form');
forms.forEach(form => {
  form.addEventListener('submit', function(e) {
    // Only block forms with placeholder URLs
    const action = this.getAttribute('action');
    if (action && (action.includes('YOUR_FORM_ID') || action.includes('example.com'))) {
      e.preventDefault();
      alert('Thanks! This form needs to be configured. Please set up the form action URL.');
    }
    // Formspree forms will submit normally
  });
});

// Mobile menu toggle (if needed)
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

console.log('✅ Sections.js loaded - Smooth scrolling active');
