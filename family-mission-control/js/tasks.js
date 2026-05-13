// Tasks Module - Full CRUD for family tasks

let tasks = JSON.parse(localStorage.getItem('fmc_tasks')) || [];

function initTasksPage() {
  renderTasksList();
  populateAssigneeDropdown();
}

function renderTasksList() {
  const container = document.getElementById('tasks-list');
  if (!container) return;
  
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  
  container.innerHTML = `
    <div class="tasks-section">
      <h3>Pending (${pendingTasks.length})</h3>
      ${pendingTasks.map(task => renderTaskItem(task)).join('')}
    </div>
    
    <div class="tasks-section completed">
      <h3>Completed (${completedTasks.length})</h3>
      ${completedTasks.map(task => renderTaskItem(task)).join('')}
    </div>
  `;
}

function renderTaskItem(task) {
  const assignee = family.find(f => f.id === task.assigneeId);
  return `
    <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <input type="checkbox" ${task.completed ? 'checked' : ''} 
             onchange="toggleTaskComplete(${task.id})">
      <div class="task-content">
        <span class="task-name">${task.name}</span>
        <span class="task-meta">${assignee ? assignee.name : 'Unassigned'} • ${task.dueDate || 'No due date'}</span>
      </div>
      <button onclick="editTask(${task.id})" class="btn-small">Edit</button>
      <button onclick="deleteTask(${task.id})" class="btn-small btn-danger">Delete</button>
    </div>
  `;
}

function populateAssigneeDropdown() {
  const select = document.getElementById('task-assignee');
  if (!select) return;
  
  select.innerHTML = family.map(member => 
    `<option value="${member.id}">${member.name}</option>`
  ).join('');
}

function addNewTask() {
  const nameInput = document.getElementById('new-task-name');
  const assigneeSelect = document.getElementById('task-assignee');
  const dueDateInput = document.getElementById('task-due-date');
  
  if (!nameInput.value.trim()) return;
  
  const newTask = {
    id: Date.now(),
    name: nameInput.value,
    assigneeId: parseInt(assigneeSelect.value),
    dueDate: dueDateInput.value,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  saveTasks();
  renderTasksList();
  
  // Clear inputs
  nameInput.value = '';
  dueDateInput.value = '';
}

function toggleTaskComplete(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasksList();
  }
}

function deleteTask(taskId) {
  if (confirm('Delete this task?')) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasksList();
  }
}

function editTask(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  const newName = prompt('Task name:', task.name);
  if (newName !== null) {
    task.name = newName;
    saveTasks();
    renderTasksList();
  }
}

function saveTasks() {
  localStorage.setItem('fmc_tasks', JSON.stringify(tasks));
}

// Export for use in main app
window.tasksModule = {
  init: initTasksPage,
  add: addNewTask,
  toggle: toggleTaskComplete,
  delete: deleteTask,
  edit: editTask
};
