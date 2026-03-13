/* =========================================================
   ui.js — Todas as funções de renderização da interface
   =========================================================
   Depende de: state.js, tasks.js (escHtml)
   ========================================================= */

// ─── Render global ───────────────────────────────────────

/** Renderiza toda a UI a partir do estado atual. */
function renderAll() {
  updateAccent();
  renderTabs();
  renderTimer();
  renderRing();
  renderDots();
  renderStats();
  renderTasks();
}

// ─── Acento de cor ───────────────────────────────────────

/** Atualiza as CSS custom properties de acento conforme o modo. */
function updateAccent() {
  const { acc, glow } = ACCENTS[state.mode];
  document.documentElement.style.setProperty('--current-accent', acc);
  document.documentElement.style.setProperty('--current-glow',   glow);
}

// ─── Abas de modo ────────────────────────────────────────

/** Marca a aba do modo atual como ativa. */
function renderTabs() {
  ['work', 'short', 'long'].forEach(m => {
    document.getElementById(`tab-${m}`).classList.toggle('active', m === state.mode);
  });
}

// ─── Timer display ───────────────────────────────────────

/** Atualiza o display de tempo, fase e sessão. */
function renderTimer() {
  const m    = Math.floor(state.remaining / 60);
  const s    = state.remaining % 60;
  const disp = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  document.getElementById('timerDisplay').textContent = disp;
  document.getElementById('timerDisplay').classList.toggle('break', state.mode !== 'work');
  document.getElementById('timerPhase').textContent   = ACCENTS[state.mode].label;
  document.getElementById('timerSession').textContent =
    `sessão ${state.session} de ${settings.sessionsPerCycle}`;
}

/** Atualiza o título da aba do browser. */
function updateTitle() {
  const m     = Math.floor(state.remaining / 60);
  const s     = state.remaining % 60;
  const phase = state.mode === 'work' ? '🍅' : '☕';
  document.title =
    `${phase} ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} — foco.`;
}

// ─── Anel SVG ────────────────────────────────────────────

/** Atualiza o stroke-dashoffset do anel de progresso. */
function renderRing() {
  const total  = getDuration(state.mode);
  const frac   = state.remaining / total;
  const circ   = 2 * Math.PI * 54; // r=54 → ≈ 339.292
  const offset = circ * (1 - frac);

  const ring = document.getElementById('ringProgress');
  ring.style.strokeDashoffset = offset;
  ring.style.strokeDasharray  = circ;
}

// ─── Dots de sessão ──────────────────────────────────────

/** Renderiza os indicadores de sessão dentro do ciclo. */
function renderDots() {
  const el = document.getElementById('sessionDots');
  el.innerHTML = '';

  for (let i = 1; i <= settings.sessionsPerCycle; i++) {
    const d = document.createElement('div');
    d.className = 'dot';
    if (i < state.session)                              d.classList.add('done');
    else if (i === state.session && state.mode === 'work') d.classList.add('current');
    el.appendChild(d);
  }
}

// ─── Stats ───────────────────────────────────────────────

/** Atualiza os três cards de estatísticas. */
function renderStats() {
  document.getElementById('statPomos').textContent = state.completedToday;

  const h = Math.floor(state.focusMinsToday / 60);
  const m = state.focusMinsToday % 60;
  document.getElementById('statFocus').textContent =
    h > 0 ? `${h}h${m > 0 ? m + 'm' : ''}` : `${m}m`;

  document.getElementById('statStreak').textContent = state.streak;
}

// ─── Tarefas ─────────────────────────────────────────────

/** Re-renderiza a lista de tarefas. */
function renderTasks() {
  const el = document.getElementById('taskList');

  if (tasks.length === 0) {
    el.innerHTML = `<div class="task-empty">Nenhuma tarefa ainda.<br>Adicione algo para focar.</div>`;
    return;
  }

  el.innerHTML = '';

  tasks.forEach(t => {
    const item = document.createElement('div');
    item.className = [
      'task-item',
      t.done          ? 'done-task'   : '',
      t.id === activeTaskId ? 'active-task' : ''
    ].filter(Boolean).join(' ');

    item.innerHTML = `
      <div class="task-check"></div>
      <span class="task-text">${escHtml(t.text)}</span>
      <span class="task-pomos">${t.pomos ? '🍅'.repeat(Math.min(t.pomos, 5)) : ''}</span>
      <span class="task-del" onclick="deleteTask(${t.id}, event)">×</span>
    `;
    item.onclick = () => selectTask(t.id);
    el.appendChild(item);
  });
}

// ─── Botão play/pause ────────────────────────────────────

/**
 * Troca o ícone do botão play entre ▶ e ⏸.
 * @param {boolean} playing
 */
function setPlayIcon(playing) {
  document.getElementById('playIcon').outerHTML = playing
    ? `<svg id="playIcon" width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
         <rect x="6" y="4" width="4" height="16"/>
         <rect x="14" y="4" width="4" height="16"/>
       </svg>`
    : `<svg id="playIcon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
         <polygon points="5 3 19 12 5 21 5 3"/>
       </svg>`;
}

// ─── Toast ───────────────────────────────────────────────

let toastTimeout = null;

/**
 * Exibe uma notificação toast temporária.
 * @param {string} icon  Emoji ou texto curto
 * @param {string} msg   Mensagem
 */
function showToast(icon, msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMsg').textContent  = msg;
  t.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => t.classList.remove('show'), 3200);
}