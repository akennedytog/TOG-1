// Calendar Module - Family events and schedules

let events = JSON.parse(localStorage.getItem('fmc_events')) || [];

function initCalendarPage() {
  renderCalendar();
  populateEventAssignee();
}

function renderCalendar() {
  const container = document.getElementById('calendar-view');
  if (!container) return;
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  container.innerHTML = `
    <div class="calendar-header">
      <button onclick="prevMonth()">←</button>
      <h2>${getMonthName(currentMonth)} ${currentYear}</h2>
      <button onclick="nextMonth()">→</button>
    </div>
    <div class="calendar-grid">
      ${renderCalendarGrid(currentMonth, currentYear)}
    </div>
    <div class="events-list">
      <h3>Today's Events</h3>
      ${renderTodayEvents()}
    </div>
  `;
}

function renderCalendarGrid(month, year) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date().getDate();
  const currentMonth = new Date().getMonth() === month;
  
  let html = '<div class="day-header">Sun</div><div class="day-header">Mon</div><div class="day-header">Tue</div><div class="day-header">Wed</div><div class="day-header">Thu</div><div class="day-header">Fri</div><div class="day-header">Sat</div>';
  
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    html += '<div class="day-cell empty"></div>';
  }
  
  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = currentMonth && day === today;
    const hasEvents = getEventsForDay(year, month, day).length > 0;
    
    html += `
      <div class="day-cell ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}" onclick="showDayEvents(${year}, ${month}, ${day})">
        <span class="day-number">${day}</span>
        ${hasEvents ? '<span class="event-dot"></span>' : ''}
      </div>
    `;
  }
  
  return html;
}

function getEventsForDay(year, month, day) {
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return events.filter(e => e.date === dateStr);
}

function renderTodayEvents() {
  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter(e => e.date === today);
  
  if (todayEvents.length === 0) {
    return '<p class="no-events">No events today</p>';
  }
  
  return todayEvents.map(event => `
    <div class="event-item" style="border-left-color: ${event.color || '#3b82f6'}">
      <div class="event-time">${event.time || 'All day'}</div>
      <div class="event-title">${event.title}</div>
      <div class="event-attendees">${getAttendeeNames(event.attendees)}</div>
    </div>
  `).join('');
}

function addEvent() {
  const titleInput = document.getElementById('event-title');
  const dateInput = document.getElementById('event-date');
  const timeInput = document.getElementById('event-time');
  const typeInput = document.getElementById('event-type');
  
  if (!titleInput.value || !dateInput.value) return;
  
  const newEvent = {
    id: Date.now(),
    title: titleInput.value,
    date: dateInput.value,
    time: timeInput.value,
    type: typeInput.value,
    color: getEventColor(typeInput.value),
    createdAt: new Date().toISOString()
  };
  
  events.push(newEvent);
  saveEvents();
  renderCalendar();
  
  // Clear inputs
  titleInput.value = '';
  timeInput.value = '';
}

function getEventColor(type) {
  const colors = {
    'school': '#8b5cf6',
    'sports': '#10b981',
    'medical': '#ef4444',
    'activity': '#f59e0b',
    'family': '#3b82f6',
    'other': '#64748b'
  };
  return colors[type] || colors['other'];
}

function getMonthName(month) {
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  return names[month];
}

function saveEvents() {
  localStorage.setItem('fmc_events', JSON.stringify(events));
}

window.calendarModule = {
  init: initCalendarPage,
  add: addEvent
};