// Plausible Analytics - privacy-friendly, no cookies.
(function () {
  var script = document.createElement("script");
  script.defer = true;
  script.setAttribute("data-domain", "theonegroup.info");
  script.src = "https://plausible.io/js/plausible.js";
  document.head.appendChild(script);
})();

// Unified tracker: emits to Plausible and GA4 (if GA is present).
function trackEvent(eventName, props) {
  var eventProps = props || {};

  if (window.plausible) {
    window.plausible(eventName, { props: eventProps });
  }

  if (window.gtag) {
    window.gtag("event", eventName, eventProps);
  }
}

window.trackEvent = trackEvent;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function navLinkClass(isActive) {
  if (isActive) {
    return "text-primary-600 dark:text-primary-400 font-medium";
  }
  return "text-gray-600 dark:text-gray-300 hover:text-primary-600 transition";
}

function renderConsistentTopNav() {
  var nav = document.getElementById("main-nav");
  if (!nav) {
    return;
  }

  var path = (window.location.pathname || "/").toLowerCase();
  var source = encodeURIComponent(path === "/" ? "home" : path.replace(/\//g, "").replace(".html", "") || "website");
  var ctaHref = "/qualify.html?source=" + source + "-nav";

  var desktopLinks = [
    { href: "/about.html", label: "About", active: path.indexOf("/about") === 0 },
    { href: "/ai-growth-sprint.html", label: "AI Growth Sprint", active: path.indexOf("/ai-growth-sprint") === 0 },
    { href: "/case-studies.html", label: "Case Studies", active: path.indexOf("/case-studies") === 0 || path.indexOf("/proof-hvac-case-study") === 0 },
    { href: "/ai-agent-workshop.html", label: "Free Workshop", active: path.indexOf("/ai-agent-workshop") === 0 },
    { href: "/blog.html", label: "Blog", active: path.indexOf("/blog") === 0 }
  ];

  var servicesActive = path.indexOf("/services") === 0 ||
    path.indexOf("/ai-audit") === 0 ||
    path.indexOf("/ai-optimization") === 0 ||
    path.indexOf("/competitor-monitoring") === 0 ||
    path.indexOf("/social-media") === 0 ||
    path.indexOf("/web-design") === 0 ||
    path.indexOf("/lead-lists") === 0 ||
    path.indexOf("/openclaw-setup") === 0 ||
    path.indexOf("/ai-assessment") === 0 ||
    path.indexOf("/ai-coaching") === 0;

  var desktopLinksHtml = desktopLinks.map(function (item) {
    return '<a href="' + item.href + '" class="' + navLinkClass(item.active) + '">' + escapeHtml(item.label) + "</a>";
  }).join("");

  var mobileLinksHtml = desktopLinks.map(function (item) {
    return '<a href="' + item.href + '" class="' + navLinkClass(item.active) + ' py-2">' + escapeHtml(item.label) + "</a>";
  }).join("");

  nav.className = "fixed top-0 left-0 right-0 z-50 glass bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 transition-all duration-300";
  nav.innerHTML =
    '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">' +
    '<div class="flex justify-between items-center h-16">' +
    '<a href="/" class="flex items-center gap-2"><span class="font-display font-bold text-xl gradient-text">The One Group</span></a>' +
    '<div class="md:hidden flex items-center">' +
    '<button id="mobile-menu-btn" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition" aria-label="Toggle navigation">' +
    '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>' +
    "</svg>" +
    "</button>" +
    "</div>" +
    '<div class="hidden md:flex items-center space-x-8">' +
    desktopLinksHtml +
    '<div class="relative services-dropdown-container">' +
    '<button class="services-dropdown-btn ' + navLinkClass(servicesActive) + ' flex items-center gap-1">Services' +
    '<svg class="w-4 h-4 dropdown-arrow transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>' +
    "</svg>" +
    "</button>" +
    '<div class="services-dropdown absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hidden p-2 z-50">' +
    '<a href="/services.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">All Services</a>' +
    '<a href="/ai-audit.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">AI Visibility Audit</a>' +
    '<a href="/ai-optimization.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">AI Implementation</a>' +
    '<a href="/competitor-monitoring.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">Competitor Intel</a>' +
    '<a href="/social-media.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">Social Media</a>' +
    '<a href="/web-design.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">Web Design</a>' +
    '<a href="/lead-lists.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">Premium Lead Lists</a>' +
    '<a href="/openclaw-setup.html" class="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 rounded-lg transition">OpenClaw Setup</a>' +
    "</div>" +
    "</div>" +
    "</div>" +
    '<a href="' + ctaHref + '" class="hidden md:inline-flex items-center px-4 py-2 gradient-bg text-white font-medium rounded-lg hover:opacity-90 transition">Qualify and Book</a>' +
    "</div>" +
    '<div id="mobile-menu" class="hidden md:hidden pb-4">' +
    '<div class="flex flex-col space-y-2">' +
    mobileLinksHtml +
    '<div class="mobile-services-container">' +
    '<button class="mobile-services-btn ' + navLinkClass(servicesActive) + ' py-2 flex items-center justify-between w-full"><span>Services</span>' +
    '<svg class="w-4 h-4 mobile-dropdown-arrow transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>' +
    "</svg>" +
    "</button>" +
    '<div class="mobile-services-dropdown hidden pl-4 space-y-1 mt-1">' +
    '<a href="/services.html" class="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">All Services</a>' +
    '<a href="/ai-audit.html" class="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">AI Visibility Audit</a>' +
    '<a href="/ai-optimization.html" class="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">AI Implementation</a>' +
    '<a href="/competitor-monitoring.html" class="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">Competitor Intel</a>' +
    '<a href="/social-media.html" class="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">Social Media</a>' +
    '<a href="/web-design.html" class="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">Web Design</a>' +
    '<a href="/lead-lists.html" class="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">Premium Lead Lists</a>' +
    '<a href="/openclaw-setup.html" class="block py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600">OpenClaw Setup</a>' +
    "</div>" +
    "</div>" +
    '<div class="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">' +
    '<a href="' + ctaHref + '" class="inline-flex items-center justify-center px-4 py-2 gradient-bg text-white font-medium rounded-lg hover:opacity-90 transition mt-2">Qualify and Book</a>' +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>";

  var desktopServicesBtn = nav.querySelector(".services-dropdown-btn");
  var desktopDropdown = nav.querySelector(".services-dropdown");
  var desktopArrow = nav.querySelector(".dropdown-arrow");
  if (desktopServicesBtn && desktopDropdown && desktopArrow) {
    desktopServicesBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      desktopDropdown.classList.toggle("hidden");
      desktopArrow.classList.toggle("rotate-180");
    });

    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target)) {
        desktopDropdown.classList.add("hidden");
        desktopArrow.classList.remove("rotate-180");
      }
    });
  }

  var mobileBtn = nav.querySelector("#mobile-menu-btn");
  var mobileMenu = nav.querySelector("#mobile-menu");
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", function () {
      mobileMenu.classList.toggle("hidden");
    });
  }

  var mobileServicesBtn = nav.querySelector(".mobile-services-btn");
  var mobileServicesDropdown = nav.querySelector(".mobile-services-dropdown");
  var mobileArrow = nav.querySelector(".mobile-dropdown-arrow");
  if (mobileServicesBtn && mobileServicesDropdown && mobileArrow) {
    mobileServicesBtn.addEventListener("click", function () {
      mobileServicesDropdown.classList.toggle("hidden");
      mobileArrow.classList.toggle("rotate-180");
    });
  }
}

function trackPageFunnelView() {
  var path = (window.location.pathname || "").toLowerCase();

  if (path.indexOf("proof-hvac-case-study") !== -1) {
    trackEvent("proof_view", { page: path });
  }

  if (path.indexOf("ai-growth-sprint") !== -1) {
    trackEvent("sprint_view", { page: path });
  }
}

// Track Calendly booking confirmations where Calendly postMessage is available.
window.addEventListener("message", function (e) {
  if (!e || !e.data || e.data.event !== "calendly.event_scheduled") {
    return;
  }

  trackEvent("calendly_booked", {
    page: window.location.pathname,
    source: "calendly_postmessage"
  });
});

document.addEventListener("DOMContentLoaded", function () {
  renderConsistentTopNav();
  trackPageFunnelView();

  // Track CTA interactions.
  var bookButtons = document.querySelectorAll('a[href*="#book"], a[href*="calendly.com"], a[href*="/ai-agent-workshop"]');
  bookButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var href = btn.getAttribute("href") || "";
      trackEvent("cta_click", {
        button: btn.textContent.trim(),
        page: window.location.pathname,
        href: href
      });

      if (href.indexOf("calendly.com") !== -1) {
        trackEvent("calendly_booked", {
          page: window.location.pathname,
          source: "calendly_click"
        });
      }
    });
  });
});
