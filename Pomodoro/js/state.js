/* =========================================================
   state.js — Estado global, constantes e persistência
   =========================================================
   Carregado PRIMEIRO. Todos os outros módulos leem/escrevem
   nestas variáveis compartilhadas via escopo global.
   ========================================================= */

// ─── Chaves de localStorage ──────────────────────────────
const SETTINGS_KEY = 'foco_settings_v2';
const HISTORY_KEY  = 'foco_history_v2';
const STATS_KEY    = 'foco_stats_v2';
const TASKS_KEY    = 'foco_tasks_v2';

// ─── Valores padrão (fonte de verdade para reset/merge) ──
const DEFAULT_SETTINGS = {
  workMins:        25,
  shortMins:        5,
  longMins:        15,
  sessionsPerCycle: 4,
  autoBreak:       false,
  autoWork:        false,
  notifications:   true,
  theme:           'dark'   // 'dark' | 'light'
};

// ─── Configurações do usuário ────────────────────────────
let settings = { ...DEFAULT_SETTINGS };

// ─── Estado da sessão atual ──────────────────────────────
let state = {
  mode:           'work',   // 'work' | 'short' | 'long'
  running:        false,
  remaining:      0,        // segundos restantes
  session:        1,        // sessão atual dentro do ciclo
  completedToday: 0,
  focusMinsToday: 0,
  streak:         0,
  lastDate:       ''        // data da última sessão (toDateString)
};

// ─── Dados de tarefas e histórico ────────────────────────
// Arrays mutados in-place para preservar referências externas
let tasks        = [];
let history      = [];
let activeTaskId = null;

// ─── Paletas de acentos por tema ─────────────────────────
// Espelham exatamente os tokens CSS de base.css.
// getAccents() é chamada em ui.js sempre que updateAccent() roda,
// garantindo que a cor injetada via JS bata com o tema ativo.
const ACCENT_PALETTES = {
  dark: {
    work:  { acc: '#e8c547', glow: 'rgba(232,197,71,0.18)',  label: 'Foco'        },
    short: { acc: '#5ce8a4', glow: 'rgba(92,232,164,0.18)',  label: 'Pausa Curta' },
    long:  { acc: '#5cb8e8', glow: 'rgba(92,184,232,0.18)',  label: 'Pausa Longa' }
  },
  light: {
    work:  { acc: '#b8860b', glow: 'rgba(184,134,11,0.10)',  label: 'Foco'        },
    short: { acc: '#1a9e68', glow: 'rgba(26,158,104,0.10)',  label: 'Pausa Curta' },
    long:  { acc: '#1a72b8', glow: 'rgba(26,114,184,0.10)',  label: 'Pausa Longa' }
  }
};

/**
 * Retorna o mapa de acentos { work, short, long } para o tema atual.
 * Usar sempre esta função — nunca referenciar ACCENT_PALETTES diretamente.
 */
function getAccents() {
  return ACCENT_PALETTES[settings.theme] || ACCENT_PALETTES.dark;
}

// ─── Limites das configurações numéricas ─────────────────
const SETTING_LIMITS = {
  workMins:        [1, 90],
  shortMins:       [1, 30],
  longMins:        [1, 60],
  sessionsPerCycle:[2,  8]
};

// ─── Sanitização ─────────────────────────────────────────

/**
 * Valida e sanitiza um objeto de settings carregado do localStorage.
 * @param {object} raw
 * @returns {object}
 */
function _sanitizeSettings(raw) {
  const out = { ...DEFAULT_SETTINGS };

  // Campos numéricos
  for (const [key, [min, max]] of Object.entries(SETTING_LIMITS)) {
    if (typeof raw[key] === 'number' && isFinite(raw[key])) {
      out[key] = Math.max(min, Math.min(max, Math.round(raw[key])));
    }
  }

  // Campos booleanos
  for (const key of ['autoBreak', 'autoWork', 'notifications']) {
    if (typeof raw[key] === 'boolean') {
      out[key] = raw[key];
    }
  }

  // Tema — aceita apenas valores conhecidos
  if (raw.theme === 'light' || raw.theme === 'dark') {
    out.theme = raw.theme;
  }

  return out;
}

/**
 * Valida um array de tarefas carregado do localStorage.
 * @param {any[]} raw
 * @returns {{ id: number, text: string, done: boolean, pomos: number }[]}
 */
function _sanitizeTasks(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(t =>
      t &&
      typeof t.id   === 'number' &&
      typeof t.text === 'string' &&
      t.text.trim().length > 0
    )
    .map(t => ({
      id:    t.id,
      text:  String(t.text).slice(0, 80),
      done:  Boolean(t.done),
      pomos: typeof t.pomos === 'number' && t.pomos >= 0 ? Math.floor(t.pomos) : 0
    }));
}

/**
 * Valida um array de histórico carregado do localStorage.
 * @param {any[]} raw
 * @returns {{ date: string, label: string, mins: number }[]}
 */
function _sanitizeHistory(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(h =>
      h &&
      typeof h.date === 'string' &&
      typeof h.mins === 'number' &&
      isFinite(h.mins) &&
      h.mins > 0
    )
    .map(h => ({
      date:  h.date,
      label: typeof h.label === 'string' ? h.label.slice(0, 100) : 'Sessão de foco',
      mins:  Math.round(h.mins)
    }));
}

// ─── Persistência ─────────────────────────────────────────

/**
 * Carrega e sanitiza todos os dados do localStorage para as
 * variáveis globais de estado.
 */
function loadPersisted() {
  try {
    const rawSettings = localStorage.getItem(SETTINGS_KEY);
    if (rawSettings) {
      const parsed = JSON.parse(rawSettings);
      if (parsed && typeof parsed === 'object') {
        settings = _sanitizeSettings(parsed);
      }
    }

    const rawHistory = localStorage.getItem(HISTORY_KEY);
    if (rawHistory) {
      const sanitized = _sanitizeHistory(JSON.parse(rawHistory));
      history.length = 0;
      history.push(...sanitized.slice(-100));
    }

    const rawStats = localStorage.getItem(STATS_KEY);
    if (rawStats) {
      const data = JSON.parse(rawStats);
      state.completedToday = (typeof data.completedToday === 'number' && data.completedToday >= 0)
        ? Math.floor(data.completedToday) : 0;
      state.focusMinsToday = (typeof data.focusMinsToday === 'number' && data.focusMinsToday >= 0)
        ? Math.floor(data.focusMinsToday) : 0;
      state.streak   = (typeof data.streak === 'number' && data.streak >= 0)
        ? Math.floor(data.streak) : 0;
      state.lastDate = typeof data.lastDate === 'string' ? data.lastDate : '';
    }

    const rawTasks = localStorage.getItem(TASKS_KEY);
    if (rawTasks) {
      const sanitized = _sanitizeTasks(JSON.parse(rawTasks));
      tasks.length = 0;
      tasks.push(...sanitized);
      const firstActive = tasks.find(t => !t.done);
      activeTaskId = firstActive ? firstActive.id : null;
    }

  } catch (e) {
    console.warn('[foco] Erro ao carregar dados:', e);
    settings     = { ...DEFAULT_SETTINGS };
    tasks.length   = 0;
    history.length = 0;
  }
}

/**
 * Persiste settings, histórico, stats e tarefas.
 */
function savePersisted() {
  try {
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    localStorage.setItem(HISTORY_KEY,  JSON.stringify(history));
    localStorage.setItem(STATS_KEY, JSON.stringify({
      completedToday: state.completedToday,
      focusMinsToday: state.focusMinsToday,
      streak:         state.streak,
      lastDate:       new Date().toDateString()
    }));
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.warn('[foco] Erro ao salvar dados:', e);
  }
}

/**
 * Reseta contadores diários se o dia mudou.
 * Zera streak se a sequência foi quebrada (2+ dias sem uso).
 */
function checkDate() {
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const last      = state.lastDate;

  if (!last || last === today) return;

  state.completedToday = 0;
  state.focusMinsToday = 0;

  if (last !== yesterday) {
    state.streak = 0;
  }

  state.lastDate = today;
}

/**
 * Retorna a duração em segundos para um dado modo.
 * Usa 'work' como fallback para evitar NaN no timer.
 * @param {'work'|'short'|'long'} mode
 * @returns {number}
 */
function getDuration(mode) {
  const map = {
    work:  settings.workMins,
    short: settings.shortMins,
    long:  settings.longMins
  };
  const mins = map[mode];
  if (typeof mins !== 'number' || !isFinite(mins)) {
    console.warn(`[foco] getDuration: modo inválido "${mode}", usando 'work' como fallback.`);
    return settings.workMins * 60;
  }
  return mins * 60;
}