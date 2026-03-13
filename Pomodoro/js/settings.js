/* =========================================================
   settings.js — Configurações e notificações do sistema
   =========================================================
   Depende de: state.js, ui.js, timer.js
   ========================================================= */

// ─── Ajuste numérico (durações e ciclos) ─────────────────

/**
 * Incrementa ou decrementa um valor de configuração
 * dentro dos limites definidos em SETTING_LIMITS.
 * @param {string} key    Chave em `settings`
 * @param {number} delta  +1 ou -1
 */
function adjSetting(key, delta) {
  const [min, max] = SETTING_LIMITS[key];
  settings[key] = Math.max(min, Math.min(max, settings[key] + delta));

  // Atualiza o valor exibido no modal
  document.getElementById(`sv-${key}`).textContent = settings[key];

  // Efeitos colaterais imediatos
  if (key === 'sessionsPerCycle') {
    renderDots();
  }

  // Atualiza o timer se não estiver rodando
  if (!state.running && key !== 'sessionsPerCycle') {
    state.remaining = getDuration(state.mode);
    renderTimer();
    renderRing();
  }

  savePersisted();
}

// ─── Toggle booleano ─────────────────────────────────────

/**
 * Alterna uma configuração booleana (autoBreak, autoWork, notifications).
 * @param {string} key
 */
function toggleSetting(key) {
  settings[key] = !settings[key];

  const el = document.getElementById(`tog-${key}`);
  el.classList.toggle('on', settings[key]);

  // Pede permissão de notificação ao ativar
  if (key === 'notifications' && settings[key]) {
    requestNotificationPerm();
  }

  savePersisted();
}

// ─── Sincroniza a UI com os valores atuais ───────────────

/**
 * Preenche todos os inputs do modal de settings
 * a partir do objeto `settings` atual.
 */
function renderSettingsUI() {
  ['workMins', 'shortMins', 'longMins', 'sessionsPerCycle'].forEach(k => {
    const el = document.getElementById(`sv-${k}`);
    if (el) el.textContent = settings[k];
  });

  ['autoBreak', 'autoWork', 'notifications'].forEach(k => {
    const el = document.getElementById(`tog-${k}`);
    if (el) el.classList.toggle('on', settings[k]);
  });
}

// ─── Notificações nativas ────────────────────────────────

/** Solicita permissão para enviar notificações do browser. */
function requestNotificationPerm() {
  if ('Notification' in window) {
    Notification.requestPermission();
  }
}

/**
 * Envia uma notificação nativa (se habilitada e autorizada).
 * @param {string} title
 * @param {string} body
 */
function notify(title, body) {
  if (!settings.notifications) return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  new Notification(title, {
    body,
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><text y="28" font-size="28">🍅</text></svg>'
  });
}

// ─── Alternância de tema ──────────────────────────────────

/**
 * Alterna entre tema escuro e claro.
 * Persiste a escolha, aplica ao DOM e atualiza os acentos
 * para que as cores injetadas via JS batam com o novo tema.
 */
function toggleTheme() {
  settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  updateAccent();
  savePersisted();
  showToast(
    settings.theme === 'light' ? '☀️' : '🌙',
    settings.theme === 'light' ? 'Tema claro ativado' : 'Tema escuro ativado'
  );
}