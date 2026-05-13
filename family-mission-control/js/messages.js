// Messages Module - Family chat and external messaging

let messages = JSON.parse(localStorage.getItem('fmc_messages')) || [];
let contacts = JSON.parse(localStorage.getItem('fmc_contacts')) || [
  { id: 1, name: 'Dr. Smith', type: 'doctor', phone: '555-0101' },
  { id: 2, name: 'Emma\'s Teacher', type: 'teacher', phone: '555-0102' },
  { id: 3, name: 'Soccer Coach', type: 'coach', phone: '555-0103' }
];

function initMessagesPage() {
  renderChat();
  renderContacts();
  populateMessageRecipient();
}

function renderChat() {
  const container = document.getElementById('chat-messages');
  if (!container) return;
  
  container.innerHTML = messages.slice(-50).map(msg => `
    <div class="message ${msg.fromMe ? 'sent' : 'received'}">
      <div class="message-header">
        <span class="message-sender">${msg.sender}</span>
        <span class="message-time">${formatTime(msg.timestamp)}</span>
      </div>
      <div class="message-text">${msg.text}</div>
    </div>
  `).join('');
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function renderContacts() {
  const container = document.getElementById('contacts-list');
  if (!container) return;
  
  container.innerHTML = contacts.map(contact => `
    <div class="contact-item" onclick="selectContact(${contact.id})">
      <div class="contact-avatar">${getContactIcon(contact.type)}</div>
      <div class="contact-info">
        <div class="contact-name">${contact.name}</div>
        <div class="contact-type">${contact.type}</div>
      </div>
      <button class="btn-small" onclick="event.stopPropagation(); draftMessage(${contact.id})">Message</button>
    </div>
  `).join('');
}

function populateMessageRecipient() {
  const select = document.getElementById('message-recipient');
  if (!select) return;
  
  select.innerHTML = `
    <option value="family">Family Chat</option>
    <optgroup label="Contacts">
      ${contacts.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
    </optgroup>
  `;
}

function getContactIcon(type) {
  const icons = { doctor: '🩺', teacher: '📚', coach: '⚽', other: '👤' };
  return icons[type] || '👤';
}

function sendMessage() {
  const input = document.getElementById('message-input');
  const recipientSelect = document.getElementById('message-recipient');
  
  if (!input.value.trim()) return;
  
  const recipientId = recipientSelect.value;
  let recipientName = 'Family';
  
  if (recipientId !== 'family') {
    const contact = contacts.find(c => c.id == recipientId);
    recipientName = contact ? contact.name : 'Unknown';
  }
  
  const newMessage = {
    id: Date.now(),
    text: input.value,
    sender: 'Mom',
    fromMe: true,
    recipient: recipientName,
    timestamp: new Date().toISOString()
  };
  
  messages.push(newMessage);
  localStorage.setItem('fmc_messages', JSON.stringify(messages));
  
  input.value = '';
  renderChat();
  
  // Simulate reply for demo
  if (recipientId !== 'family') {
    setTimeout(() => simulateReply(recipientName), 2000);
  }
}

function simulateReply(sender) {
  const replies = [
    'Got it, thanks!',
    'Will do!',
    'Sounds good!',
    'Thanks for letting me know!'
  ];
  
  const reply = {
    id: Date.now(),
    text: replies[Math.floor(Math.random() * replies.length)],
    sender: sender,
    fromMe: false,
    timestamp: new Date().toISOString()
  };
  
  messages.push(reply);
  localStorage.setItem('fmc_messages', JSON.stringify(messages));
  renderChat();
}

function draftMessage(contactId) {
  const contact = contacts.find(c => c.id === contactId);
  if (!contact) return;
  
  const templates = {
    doctor: `Hi Dr. ${contact.name.split(' ')[1] || contact.name},

I need to schedule an appointment for my child. Are you available this week?

Thanks,`,
    teacher: `Hi ${contact.name},

Quick question about homework this week...

Thanks,`,
    coach: `Hi Coach,

Just confirming practice time for tomorrow.

Thanks!`
  };
  
  const template = templates[contact.type] || `Hi ${contact.name},`;
  
  const input = document.getElementById('message-input');
  if (input) {
    input.value = template;
    document.getElementById('message-recipient').value = contactId;
  }
}

function addContact() {
  const name = prompt('Contact name:');
  const type = prompt('Type (doctor/teacher/coach/other):') || 'other';
  
  if (name) {
    contacts.push({ id: Date.now(), name, type, phone: '' });
    localStorage.setItem('fmc_contacts', JSON.stringify(contacts));
    renderContacts();
    populateMessageRecipient();
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

window.messagesModule = {
  init: initMessagesPage,
  send: sendMessage,
  addContact: addContact,
  draft: draftMessage
};