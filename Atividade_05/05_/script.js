// Array para armazenar as tarefas
let tasks = [];
let taskIdCounter = 1;
let currentFilter = 'all';

// Elementos do DOM
const taskForm = document.querySelector('#task-form');
const taskInput = document.querySelector('#task-input');
const feedbackDiv = document.querySelector('#feedback');
const tasksContainer = document.querySelector('#tasks-container');
const emptyState = document.querySelector('#empty-state');
const taskStats = document.querySelector('#task-stats');
const taskFilters = document.querySelector('#task-filters');
const bulkActions = document.querySelector('#bulk-actions');

// Elementos das estatísticas
const totalTasksSpan = document.querySelector('#total-tasks');
const pendingTasksSpan = document.querySelector('#pending-tasks');
const completedTasksSpan = document.querySelector('#completed-tasks');

// Elementos dos filtros
const filterButtons = document.querySelectorAll('input[name="filter"]');

// Elementos das ações em lote
const markAllCompletedBtn = document.querySelector('#mark-all-completed');
const clearCompletedBtn = document.querySelector('#clear-completed');

// Inicializar aplicação
document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromStorage();
    setupEventListeners();
    updateUI();
    taskInput.focus();
});

// Configurar event listeners
function setupEventListeners() {
    // Formulário de adicionar tarefa
    taskForm.addEventListener('submit', handleAddTask);
    
    // Filtros
    filterButtons.forEach(button => {
        button.addEventListener('change', handleFilterChange);
    });
    
    // Ações em lote
    markAllCompletedBtn.addEventListener('click', markAllTasksCompleted);
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    
    // Auto-salvar no localStorage
    window.addEventListener('beforeunload', saveTasksToStorage);
}

// Função para adicionar nova tarefa
function handleAddTask(event) {
    event.preventDefault();
    
    const taskText = taskInput.value.trim();
    
    // Validação
    if (!taskText) {
        showFeedback('Por favor, digite uma tarefa antes de adicionar.', 'warning');
        taskInput.focus();
        return;
    }
    
    if (taskText.length > 100) {
        showFeedback('A tarefa deve ter no máximo 100 caracteres.', 'warning');
        return;
    }
    
    // Verificar se já existe tarefa idêntica
    if (tasks.some(task => task.text.toLowerCase() === taskText.toLowerCase())) {
        showFeedback('Esta tarefa já existe na sua lista.', 'info');
        return;
    }
    
    // Criar nova tarefa
    const newTask = {
        id: taskIdCounter++,
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
    };
    
    // Adicionar à lista
    tasks.unshift(newTask); // Adiciona no início
    
    // Limpar formulário
    taskInput.value = '';
    clearFeedback();
    
    // Atualizar UI
    updateUI();
    saveTasksToStorage();
    
    // Feedback de sucesso
    showFeedback('Tarefa adicionada com sucesso!', 'success', 2000);
    
    // Focar no input para próxima tarefa
    taskInput.focus();
}

// Função para alternar status da tarefa
function toggleTaskStatus(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        
        updateUI();
        saveTasksToStorage();
        
        const statusText = task.completed ? 'concluída' : 'marcada como pendente';
        showFeedback(`Tarefa ${statusText}!`, 'success', 1500);
    }
}

// Função para remover tarefa
function removeTask(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        const removedTask = tasks.splice(taskIndex, 1)[0];
        
        updateUI();
        saveTasksToStorage();
        
        showFeedback(`Tarefa "${removedTask.text}" foi removida.`, 'info', 2000);
    }
}

// Função para atualizar toda a UI
function updateUI() {
    updateStats();
    renderTasks();
    updateVisibility();
    updateBulkActions();
}

// Função para atualizar estatísticas
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    
    totalTasksSpan.textContent = total;
    pendingTasksSpan.textContent = pending;
    completedTasksSpan.textContent = completed;
}

// Função para renderizar tarefas
function renderTasks() {
    tasksContainer.innerHTML = '';
    
    const filteredTasks = getFilteredTasks();
    
    if (filteredTasks.length === 0) {
        return; // Empty state será mostrado pela updateVisibility
    }
    
    const fragment = document.createDocumentFragment();
    
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        fragment.appendChild(taskElement);
    });
    
    tasksContainer.appendChild(fragment);
}

// Função para criar elemento de tarefa
function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.className = `list-group-item d-flex align-items-center p-3 ${task.completed ? 'bg-light' : ''}`;
    taskItem.style.transition = 'all 0.3s ease';
    
    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'form-check-input me-3 fs-5';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
    
    // Texto da tarefa
    const taskText = document.createElement('div');
    taskText.className = 'flex-grow-1';
    
    const textSpan = document.createElement('span');
    textSpan.className = `${task.completed ? 'text-decoration-line-through text-muted' : ''}`;
    textSpan.textContent = task.text;
    
    const timeInfo = document.createElement('small');
    timeInfo.className = 'text-muted d-block mt-1';
    timeInfo.textContent = getTaskTimeInfo(task);
    
    taskText.appendChild(textSpan);
    taskText.appendChild(timeInfo);
    
    // Botão remover
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-outline-danger btn-sm ms-2';
    removeBtn.innerHTML = '<i class="bi bi-trash"></i>';
    removeBtn.title = 'Remover tarefa';
    removeBtn.addEventListener('click', () => {
        if (confirm(`Tem certeza que deseja remover a tarefa "${task.text}"?`)) {
            removeTask(task.id);
        }
    });
    
    // Montar elemento
    taskItem.appendChild(checkbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(removeBtn);
    
    return taskItem;
}

// Função para obter informações de tempo da tarefa
function getTaskTimeInfo(task) {
    const createdDate = new Date(task.createdAt);
    const now = new Date();
    const diffTime = now - createdDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    let timeText = '';
    if (diffDays > 0) {
        timeText = `Criada há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
        timeText = `Criada há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffMinutes > 0) {
        timeText = `Criada há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    } else {
        timeText = 'Criada agora';
    }
    
    if (task.completed && task.completedAt) {
        const completedDate = new Date(task.completedAt);
        const completedDiff = now - completedDate;
        const completedMinutes = Math.floor(completedDiff / (1000 * 60));
        
        if (completedMinutes > 0) {
            timeText += ` • Concluída há ${completedMinutes} minuto${completedMinutes > 1 ? 's' : ''}`;
        } else {
            timeText += ' • Concluída agora';
        }
    }
    
    return timeText;
}

// Função para obter tarefas filtradas
function getFilteredTasks() {
    switch (currentFilter) {
        case 'pending':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        default:
            return tasks;
    }
}

// Função para atualizar visibilidade dos elementos
function updateVisibility() {
    const hasTasks = tasks.length > 0;
    const hasFilteredTasks = getFilteredTasks().length > 0;
    
    // Mostrar/esconder elementos baseado na existência de tarefas
    taskStats.hidden = !hasTasks;
    taskFilters.hidden = !hasTasks;
    bulkActions.hidden = !hasTasks;
    
    // Mostrar/esconder lista vs estado vazio
    tasksContainer.hidden = !hasFilteredTasks;
    emptyState.hidden = hasFilteredTasks;
    
    // Atualizar mensagem do estado vazio baseado no filtro
    if (!hasFilteredTasks && hasTasks) {
        updateEmptyStateMessage();
    }
}

// Função para atualizar mensagem do estado vazio
function updateEmptyStateMessage() {
    const emptyIcon = emptyState.querySelector('i');
    const emptyTitle = emptyState.querySelector('h3');
    const emptyText = emptyState.querySelector('p');
    
    switch (currentFilter) {
        case 'pending':
            emptyIcon.className = 'bi bi-check-circle display-1 text-success';
            emptyTitle.textContent = 'Todas as tarefas concluídas!';
            emptyText.textContent = 'Parabéns! Você completou todas as suas tarefas.';
            break;
        case 'completed':
            emptyIcon.className = 'bi bi-clock display-1 text-warning';
            emptyTitle.textContent = 'Nenhuma tarefa concluída';
            emptyText.textContent = 'Complete algumas tarefas para vê-las aqui.';
            break;
        default:
            emptyIcon.className = 'bi bi-clipboard-x display-1 text-muted';
            emptyTitle.textContent = 'Nenhuma tarefa ainda';
            emptyText.textContent = 'Adicione sua primeira tarefa usando o campo acima!';
    }
}

// Função para atualizar ações em lote
function updateBulkActions() {
    const hasPendingTasks = tasks.some(task => !task.completed);
    const hasCompletedTasks = tasks.some(task => task.completed);
    
    markAllCompletedBtn.disabled = !hasPendingTasks;
    clearCompletedBtn.disabled = !hasCompletedTasks;
}

// Função para lidar com mudança de filtro
function handleFilterChange(event) {
    currentFilter = event.target.value;
    updateUI();
}

// Função para marcar todas as tarefas como concluídas
function markAllTasksCompleted() {
    const pendingTasks = tasks.filter(task => !task.completed);
    
    if (pendingTasks.length === 0) return;
    
    pendingTasks.forEach(task => {
        task.completed = true;
        task.completedAt = new Date().toISOString();
    });
    
    updateUI();
    saveTasksToStorage();
    
    showFeedback(`${pendingTasks.length} tarefa${pendingTasks.length > 1 ? 's' : ''} marcada${pendingTasks.length > 1 ? 's' : ''} como concluída${pendingTasks.length > 1 ? 's' : ''}!`, 'success');
}

// Função para limpar tarefas concluídas
function clearCompletedTasks() {
    const completedCount = tasks.filter(task => task.completed).length;
    
    if (completedCount === 0) return;
    
    if (confirm(`Tem certeza que deseja remover ${completedCount} tarefa${completedCount > 1 ? 's' : ''} concluída${completedCount > 1 ? 's' : ''}?`)) {
        tasks = tasks.filter(task => !task.completed);
        
        updateUI();
        saveTasksToStorage();
        
        showFeedback(`${completedCount} tarefa${completedCount > 1 ? 's' : ''} concluída${completedCount > 1 ? 's' : ''} removida${completedCount > 1 ? 's' : ''}!`, 'info');
    }
}

// Função para mostrar feedback
function showFeedback(message, type, duration = 3000) {
    feedbackDiv.hidden = false;
    feedbackDiv.className = `alert alert-${type}`;
    feedbackDiv.innerHTML = `<i class="bi bi-info-circle-fill me-2"></i>${message}`;
    
    // Auto-hide feedback
    setTimeout(() => {
        clearFeedback();
    }, duration);
}

// Função para limpar feedback
function clearFeedback() {
    feedbackDiv.hidden = true;
    feedbackDiv.className = '';
    feedbackDiv.innerHTML = '';
}

// Função para salvar tarefas no localStorage
function saveTasksToStorage() {
    try {
        localStorage.setItem('todoTasks', JSON.stringify(tasks));
        localStorage.setItem('todoTaskIdCounter', taskIdCounter.toString());
    } catch (error) {
        console.warn('Não foi possível salvar as tarefas no localStorage:', error);
    }
}

// Função para carregar tarefas do localStorage
function loadTasksFromStorage() {
    try {
        const savedTasks = localStorage.getItem('todoTasks');
        const savedCounter = localStorage.getItem('todoTaskIdCounter');
        
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
        
        if (savedCounter) {
            taskIdCounter = parseInt(savedCounter);
        }
    } catch (error) {
        console.warn('Não foi possível carregar as tarefas do localStorage:', error);
        tasks = [];
        taskIdCounter = 1;
    }
}
