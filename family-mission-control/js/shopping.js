// Shopping List Module - Grocery and household items

let shoppingList = JSON.parse(localStorage.getItem('fmc_shopping')) || [];

function initShoppingPage() {
  renderShoppingList();
  populateCategoryDropdown();
}

function renderShoppingList() {
  const container = document.getElementById('shopping-list');
  if (!container) return;
  
  const categories = groupByCategory(shoppingList);
  
  container.innerHTML = Object.entries(categories).map(([category, items]) => `
    <div class="shopping-category">
      <h3>${category} (${items.length})</h3>
      ${items.map(item => renderShoppingItem(item)).join('')}
    </div>
  `).join('');
}

function groupByCategory(items) {
  const groups = {};
  items.forEach(item => {
    const cat = item.category || 'Other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  });
  return groups;
}

function renderShoppingItem(item) {
  return `
    <div class="shopping-item ${item.purchased ? 'purchased' : ''}" data-id="${item.id}">
      <input type="checkbox" ${item.purchased ? 'checked' : ''}
             onchange="togglePurchased(${item.id})">
      <span class="item-name">${item.name}</span>
      <span class="item-quantity">${item.quantity || 1}x</span>
      <button onclick="editShoppingItem(${item.id})" class="btn-small">Edit</button>
      <button onclick="deleteShoppingItem(${item.id})" class="btn-small btn-danger">Delete</button>
    </div>
  `;
}

function populateCategoryDropdown() {
  const select = document.getElementById('shopping-category');
  if (!select) return;
  
  const categories = ['Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Household', 'Personal', 'Other'];
  select.innerHTML = categories.map(cat => `
    <option value="${cat}">${cat}</option>
  `).join('');
}

function addShoppingItem() {
  const nameInput = document.getElementById('shopping-item-name');
  const qtyInput = document.getElementById('shopping-quantity');
  const catSelect = document.getElementById('shopping-category');
  
  if (!nameInput.value.trim()) return;
  
  const newItem = {
    id: Date.now(),
    name: nameInput.value,
    quantity: parseInt(qtyInput.value) || 1,
    category: catSelect.value,
    purchased: false,
    addedBy: 'Mom',
    addedAt: new Date().toISOString()
  };
  
  shoppingList.push(newItem);
  saveShoppingList();
  renderShoppingList();
  
  nameInput.value = '';
  qtyInput.value = '1';
}

function togglePurchased(itemId) {
  const item = shoppingList.find(i => i.id === itemId);
  if (item) {
    item.purchased = !item.purchased;
    saveShoppingList();
    renderShoppingList();
  }
}

function deleteShoppingItem(itemId) {
  shoppingList = shoppingList.filter(i => i.id !== itemId);
  saveShoppingList();
  renderShoppingList();
}

function editShoppingItem(itemId) {
  const item = shoppingList.find(i => i.id === itemId);
  if (!item) return;
  
  const newName = prompt('Item name:', item.name);
  const newQty = prompt('Quantity:', item.quantity);
  
  if (newName !== null) {
    item.name = newName;
    if (newQty) item.quantity = parseInt(newQty);
    saveShoppingList();
    renderShoppingList();
  }
}

function clearPurchased() {
  if (confirm('Clear all purchased items?')) {
    shoppingList = shoppingList.filter(i => !i.purchased);
    saveShoppingList();
    renderShoppingList();
  }
}

function saveShoppingList() {
  localStorage.setItem('fmc_shopping', JSON.stringify(shoppingList));
}

// Export
window.shoppingModule = {
  init: initShoppingPage,
  add: addShoppingItem,
  toggle: togglePurchased,
  delete: deleteShoppingItem,
  edit: editShoppingItem,
  clear: clearPurchased
};
