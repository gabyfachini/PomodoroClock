/* =========================================================
   tasks.js — Gerenciamento de tarefas
   =========================================================
   Depende de: state.js, ui.js
   ========================================================= */

let taskInputVisible = false;

// ─── Visibilidade do input ───────────────────────────────

/** Alterna a visibilidade do campo de nova tarefa. */
function focusTaskInput() {
  taskInputVisible = !taskInputVisible;
  const row = document.getElementById('taskInputRow');
  row.style.display = taskInputVisible ? 'flex' : 'none';
  if (taskInputVisible) document.getElementById('taskInput').focus();
}

/** Handler de teclado no input de tarefa. */
function handleTaskKey(e) {
  if (e.key === 'Enter')  addTask();
  if (e.key === 'Escape') focusTaskInput();
}

// ─── CRUD ────────────────────────────────────────────────

/** Adiciona uma nova tarefa à lista. */
function addTask() {
  const inp  = document.getElementById('taskInput');
  const text = inp.value.trim();
  if (!text) return;

  const id = Date.now();
  tasks.push({ id, text, done: false, pomos: 0 });
  inp.value = '';

  // Seleciona automaticamente se não houver tarefa ativa
  if (activeTaskId === null) activeTaskId = id;

  savePersisted();
  renderTasks();
  focusTaskInput();
}

/**
 * Clique em uma tarefa:
 * - Se já estiver concluída → reabre
 * - Se for a tarefa ativa → marca como concluída
 * - Caso contrário → seleciona como ativa
 * @param {number} id
 */
function selectTask(id) {
  const t = tasks.find(t => t.id === id);

  if (t.done) {
    t.done = false;
    savePersisted();
    renderTasks();
    return;
  }

  if (activeTaskId === id) {
    // Segundo clique na tarefa ativa → concluir
    t.done = true;
    activeTaskId = null;
    const next = tasks.find(t => !t.done);
    if (next) activeTaskId = next.id;
    showToast('✅', `"${t.text.slice(0, 30)}" concluída!`);
  } else {
    activeTaskId = id;
  }

  savePersisted();
  renderTasks();
}

/**
 * Remove uma tarefa permanentemente.
 * @param {number} id
 * @param {Event}  e   — Evento de clique (para stopPropagation)
 */
function deleteTask(id, e) {
  e.stopPropagation();
  tasks = tasks.filter(t => t.id !== id);

  if (activeTaskId === id) {
    const next = tasks.find(t => !t.done);
    activeTaskId = next ? next.id : null;
  }

  savePersisted();
  renderTasks();
}

// ─── Utilitários ─────────────────────────────────────────

/**
 * Escapa caracteres HTML para evitar XSS na renderização.
 * @param {string} str
 * @returns {string}
 */
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}