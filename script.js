document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const taskDate = document.getElementById('task-date');
    const taskCategory = document.getElementById('task-category');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    
    const searchInput = document.getElementById('search-input');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const themeToggle = document.getElementById('theme-toggle');
    
    // Stats Elements
    const totalTasksCount = document.getElementById('total-tasks-count');
    const pendingTasksCount = document.getElementById('pending-tasks-count');
    const completedTasksCount = document.getElementById('completed-tasks-count');
    
    // Modal Elements
    const editModal = document.getElementById('edit-modal');
    const editTaskInput = document.getElementById('edit-task-input');
    const editTaskDate = document.getElementById('edit-task-date');
    const editTaskCategory = document.getElementById('edit-task-category');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    
    // State
    let tasks = JSON.parse(localStorage.getItem('studentTasks')) || [];
    let currentFilter = 'all';
    let editTaskId = null;
    
    // Initialize Theme
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Core Functions
    function saveTasks() {
        localStorage.setItem('studentTasks', JSON.stringify(tasks));
        updateStats();
    }
    
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    function addTask() {
        const text = taskInput.value.trim();
        const date = taskDate.value;
        const category = taskCategory.value;
        
        if (!text) {
            alert('Please enter a task description.');
            return;
        }
        
        const newTask = {
            id: generateId(),
            text: text,
            date: date,
            category: category,
            completed: false
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        
        // Clear inputs
        taskInput.value = '';
        taskDate.value = '';
        taskCategory.value = 'Study';
    }
    
    function toggleTaskComplete(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }
    
    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }
    
    function openEditModal(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            editTaskId = id;
            editTaskInput.value = task.text;
            editTaskDate.value = task.date;
            editTaskCategory.value = task.category;
            editModal.classList.add('show');
        }
    }
    
    function saveEditedTask() {
        if (!editTaskId) return;
        
        const text = editTaskInput.value.trim();
        if (!text) {
            alert('Task cannot be empty');
            return;
        }
        
        const taskIndex = tasks.findIndex(t => t.id === editTaskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].text = text;
            tasks[taskIndex].date = editTaskDate.value;
            tasks[taskIndex].category = editTaskCategory.value;
            
            saveTasks();
            renderTasks();
            closeModal();
        }
    }
    
    function closeModal() {
        editModal.classList.remove('show');
        editTaskId = null;
    }
    
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        totalTasksCount.textContent = total;
        completedTasksCount.textContent = completed;
        pendingTasksCount.textContent = pending;
    }
    
    function getCategoryBadgeClass(category) {
        switch (category.toLowerCase()) {
            case 'study': return 'badge-study';
            case 'personal': return 'badge-personal';
            case 'exam': return 'badge-exam';
            default: return 'badge-study';
        }
    }
    
    function renderTasks() {
        const searchTerm = searchInput.value.toLowerCase();
        
        // Filter and Search
        const filteredTasks = tasks.filter(task => {
            const matchesSearch = task.text.toLowerCase().includes(searchTerm);
            const matchesFilter = 
                currentFilter === 'all' ? true :
                currentFilter === 'completed' ? task.completed :
                !task.completed;
                
            return matchesSearch && matchesFilter;
        });
        
        taskList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); margin-top: 20px;">No tasks found.</p>';
            return;
        }
        
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.style.borderLeftColor = `var(--cat-${task.category.toLowerCase()})`;
            
            const dateStr = task.date ? `<div class="task-due-date"><i class="far fa-calendar-alt"></i> ${new Date(task.date).toLocaleDateString()}</div>` : '';
            
            li.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                    <div class="task-details">
                        <span class="task-text">${task.text}</span>
                        <div class="task-meta">
                            <span class="task-badge ${getCategoryBadgeClass(task.category)}">${task.category}</span>
                            ${dateStr}
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="action-btn edit" data-id="${task.id}" aria-label="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-id="${task.id}" aria-label="Delete task">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            
            taskList.appendChild(li);
        });
        
        // Add event listeners to generated buttons and checkboxes
        document.querySelectorAll('.task-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => toggleTaskComplete(e.target.dataset.id));
        });
        
        document.querySelectorAll('.action-btn.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                // Add fade out animation before deleting
                const li = e.currentTarget.closest('.task-item');
                li.style.opacity = '0';
                li.style.transform = 'translateX(-20px)';
                setTimeout(() => deleteTask(id), 300);
            });
        });
        
        document.querySelectorAll('.action-btn.edit').forEach(btn => {
            btn.addEventListener('click', (e) => openEditModal(e.currentTarget.dataset.id));
        });
    }
    
    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    searchInput.addEventListener('input', renderTasks);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });
    });
    
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.body.removeAttribute('data-theme');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('darkMode', 'false');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('darkMode', 'true');
        }
    });
    
    saveEditBtn.addEventListener('click', saveEditedTask);
    cancelEditBtn.addEventListener('click', closeModal);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeModal();
        }
    });
    
    // Initial Render
    updateStats();
    renderTasks();
});
