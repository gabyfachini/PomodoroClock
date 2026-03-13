/* =========================================================
   modals.js — Abertura, fechamento e conteúdo dos modais
   =========================================================
   Depende de: state.js, settings.js, tasks.js (escHtml)
   ========================================================= */

// ─── Abertura e fechamento ───────────────────────────────

/**
 * Abre um modal pelo nome ('settings' | 'history').
 * @param {'settings'|'history'} name
 */
function openModal(name) {
  if (name === 'history')  renderHistory();
  if (name === 'settings') renderSettingsUI();
  document.getElementById(`${name}Modal`).classList.add('open');
}

/**
 * Fecha um modal pelo nome.
 * @param {'settings'|'history'} name
 */
function closeModal(name) {
  document.getElementById(`${name}Modal`).classList.remove('open');
}

/**
 * Fecha o modal ao clicar no overlay (fora do sheet).
 * @param {MouseEvent}           e
 * @param {'settings'|'history'} name
 */
function closeModalOnBg(e, name) {
  if (e.target === e.currentTarget) closeModal(name);
}

// ─── Renderização do histórico ───────────────────────────

/** Popula o modal de histórico com as sessões registradas. */
function renderHistory() {
  const el = document.getElementById('historyList');

  if (history.length === 0) {
    el.innerHTML = `
      <div class="history-empty">
        Nenhuma sessão registrada ainda.<br>
        Complete seu primeiro pomodoro!
      </div>`;
    return;
  }

  // Agrupa sessões por data legível
  const grouped = {};
  history.forEach(h => {
    const d = new Date(h.date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day:     'numeric',
      month:   'short'
    });
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(h);
  });

  el.innerHTML = '';

  // Renderiza cada grupo (mais recente primeiro)
  Object.entries(grouped).reverse().forEach(([day, items]) => {
    const block = document.createElement('div');
    block.className = 'history-day';
    block.innerHTML = `<div class="history-day-label">${day}</div>`;

    // Sessões mais recentes no topo de cada grupo
    items.slice().reverse().forEach(h => {
      const time = new Date(h.date).toLocaleTimeString('pt-BR', {
        hour:   '2-digit',
        minute: '2-digit'
      });
      block.innerHTML += `
        <div class="history-item">
          <span class="history-task">🍅 ${escHtml(h.label || 'Sessão de foco')}</span>
          <span class="history-meta">${time} · ${h.mins}min</span>
        </div>`;
    });

    el.appendChild(block);
  });
}