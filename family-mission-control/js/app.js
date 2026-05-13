// Family Mission Control - Main App

let family = [
  { id: 1, name: 'Mom', role: 'parent', avatar: '👩' },
  { id: 2, name: 'Dad', role: 'parent', avatar: '👨' },
  { id: 3, name: 'Emma', role: 'child', avatar: '👧' },
  { id: 4, name: 'Lucas', role: 'child', avatar: '👦' }
];

let tasks = [];
let events = [];
let shoppingList = [];

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  renderFamilyMembers();
  updateStats();
});

function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-links li');
  
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      
      link.classList.add('active');
      const pageId = link.getAttribute('data-page');
      document.getElementById(pageId).classList.add('active');
      
      // Init page modules
      if (pageId === 'tasks' && window.tasksModule) tasksModule.init();
      if (pageId === 'shopping' && window.shoppingModule) shoppingModule.init();
      if (pageId === 'calendar' && window.calendarModule) calendarModule.init();
    });
  });
}

function renderFamilyMembers() {
  const container = document.getElementById('family-list');
  if (!container) return;
  container.innerHTML = family.map(member => `
    <div class="family-member">
      <div class="member-avatar">${member.avatar}</div>
      <div class="member-info">
        <h3>${member.name}</h3>
        <p>${member.role}</p>
      </div>
    </div>
  `).join('');
}

function updateStats() {
  const tasksData = JSON.parse(localStorage.getItem('fmc_tasks') || '[]');
  const eventsData = JSON.parse(localStorage.getItem('fmc_events') || '[]');
  const shoppingData = JSON.parse(localStorage.getItem('fmc_shopping') || '[]');
  
  const pendingTasks = tasksData.filter(t => !t.completed).length;
  const upcomingEvents = eventsData.filter(e => {
    const eventDate = new Date(e.date);
    const today = new Date();
    return eventDate >= today && eventDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  }).length;
  
  const upcomingEl = document.getElementById('upcoming-events');
  const pendingEl = document.getElementById('pending-tasks');
  const shoppingEl = document.getElementById('shopping-items');
  
  if (upcomingEl) upcomingEl.textContent = upcomingEvents;
  if (pendingEl) pendingEl.textContent = pendingTasks;
  if (shoppingEl) shoppingEl.textContent = shoppingData.filter(i => !i.purchased).length;
}

function quickAddTask() {
  const name = prompt('Task name:');
  if (name) {
    const tasksData = JSON.parse(localStorage.getItem('fmc_tasks') || '[]');
    tasksData.push({ id: Date.now(), name, completed: false, assigneeId: 1 });
    localStorage.setItem('fmc_tasks', JSON.stringify(tasksData));
    updateStats();
    alert('Task added!');
  }
}

function quickAddEvent() {
  const name = prompt('Event name:');
  if (name) {
    const eventsData = JSON.parse(localStorage.getItem('fmc_events') || '[]');
    eventsData.push({ id: Date.now(), title: name, date: new Date().toISOString().split('T')[0] });
    localStorage.setItem('fmc_events', JSON.stringify(eventsData));
    updateStats();
    alert('Event added!');
  }
}

function quickAddShopping() {
  const item = prompt('Shopping item:');
  if (item) {
    const shoppingData = JSON.parse(localStorage.getItem('fmc_shopping') || '[]');
    shoppingData.push({ id: Date.now(), name: item, purchased: false, quantity: 1, category: 'Other' });
    localStorage.setItem('fmc_shopping', JSON.stringify(shoppingData));
    updateStats();
    alert('Added!');
  }
}

function addFamilyMember() {
  const name = prompt('Family member name:');
  if (name) {
    family.push({ id: Date.now(), name, role: 'child', avatar: '👤' });
    renderFamilyMembers();
    localStorage.setItem('fmc_family', JSON.stringify(family));
  }
}

function loadData() {
  const saved = localStorage.getItem('fmc_family');
  if (saved) family = JSON.parse(saved);
}

loadData();
