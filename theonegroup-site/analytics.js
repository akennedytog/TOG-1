// Plausible Analytics - Privacy-friendly, no cookies
(function() {
  var script = document.createElement('script');
  script.defer = true;
  script.setAttribute('data-domain', 'theonegroup.info');
  script.src = 'https://plausible.io/js/plausible.js';
  document.head.appendChild(script);
})();

// Track custom events
function trackEvent(eventName, props) {
  if (window.plausible) {
    plausible(eventName, { props: props });
  }
}

// Track workshop bookings
window.addEventListener('message', function(e) {
  if (e.data.event === 'calendly.event_scheduled') {
    trackEvent('Workshop Booked', { 
      event_type: 'ai-agent-workshop',
      date: e.data.event.scheduled_at
    });
  }
});

// Track CTA clicks
document.addEventListener('DOMContentLoaded', function() {
  // Track "Book a Call" clicks
  var bookButtons = document.querySelectorAll('a[href*="#book"], a[href*="calendly.com"], a[href*="/ai-agent-workshop"]');
  bookButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      trackEvent('CTA Click', { 
        button: btn.textContent.trim(),
        page: window.location.pathname
      });
    });
  });
});
