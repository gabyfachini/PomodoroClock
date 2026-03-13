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

// ─── Modos válidos ────────────────────────────────────────
const VALID_MODES = ['work', 'short', 'long'];

// ─── Valores padrão (fonte de verdade para reset/merge) ──
const DEFAULT_SETTINGS = {
  workMins:        25,
  shortMins:        5,
  longMins:        15,
  sessionsPerCycle: 4,
  autoBreak:       false,
  autoWork:        false,
  notifications:   true
};

// ─── Configurações do usuário ────────────────────────────
// Sempre inicializa a partir dos defaults — nunca referencia
// diretamente DEFAULT_SETTINGS para não compartilhar a mesma referência.
let settings = { ...DEFAULT_SETTINGS };

// ─── Estado da sessão atual ──────────────────────────────
let state = {
  mode:            'work',  // 'work' | 'short' | 'long'
  running:         false,
  remaining:       0,       // segundos restantes
  session:         1,       // sessão atual dentro do ciclo
  completedToday:  0,
  focusMinsToday:  0,
  streak:          0,
  lastDate:        ''       // data da última sessão (toDateString)
};

// ─── Dados de tarefas e histórico ────────────────────────
// Usamos arrays mutados in-place (.push, .splice) para que
// módulos que guardam referência (ex: modals.js) nunca
// apontem para um array orfão após uma reatribuição.
let tasks        = [];
let history      = [];
let activeTaskId = null;

// ─── Mapa de acentos por modo ────────────────────────────
const ACCENTS = {
  work:  { acc: '#e8c547', glow: 'rgba(232,197,71,0.18)',  label: 'Foco'        },
  short: { acc: '#5ce8a4', glow: 'rgba(92,232,164,0.18)',  label: 'Pausa Curta' },
  long:  { acc: '#5cb8e8', glow: 'rgba(92,184,232,0.18)',  label: 'Pausa Longa' }
};

// ─── Limites das configurações numéricas ─────────────────
const SETTING_LIMITS = {
  workMins:        [1, 90],
  shortMins:       [1, 30],
  longMins:        [1, 60],
  sessionsPerCycle:[2,  8]
};

// ─── Sanitização ─────────────────────────────────────────

/**
 * Valida e sanitiza um objeto de settings carregado do
 * localStorage, garantindo que todos os valores estejam
 * dentro dos limites aceitáveis.
 * @param {object} raw  Objeto bruto do JSON.parse
 * @returns {object}    Settings sanitizado, mesclado com defaults
 */
function _sanitizeSettings(raw) {
  const out = { ...DEFAULT_SETTINGS };

  // Campos numéricos — aplica limites definidos em SETTING_LIMITS
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

  return out;
}

/**
 * Valida um array de tarefas carregado do localStorage.
 * Descarta entradas malformadas em vez de deixar o app quebrar.
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
 * variáveis globais de estado. Leitura feita UMA única vez;
 * checkDate() usa os valores já em memória, não relê o storage.
 */
function loadPersisted() {
  try {
    // Settings
    const rawSettings = localStorage.getItem(SETTINGS_KEY);
    if (rawSettings) {
      const parsed = JSON.parse(rawSettings);
      if (parsed && typeof parsed === 'object') {
        settings = _sanitizeSettings(parsed);
      }
    }

    // Histórico — trunca em memória também (FIX: antes só truncava no save)
    const rawHistory = localStorage.getItem(HISTORY_KEY);
    if (rawHistory) {
      const parsed = JSON.parse(rawHistory);
      const sanitized = _sanitizeHistory(parsed);
      // Muta in-place para não quebrar referências externas
      history.length = 0;
      history.push(...sanitized.slice(-100));
    }

    // Stats + lastDate lidos para o state (checkDate usa state.lastDate)
    const rawStats = localStorage.getItem(STATS_KEY);
    if (rawStats) {
      const data = JSON.parse(rawStats);
      state.completedToday = (typeof data.completedToday === 'number' && data.completedToday >= 0)
        ? Math.floor(data.completedToday) : 0;
      state.focusMinsToday = (typeof data.focusMinsToday === 'number' && data.focusMinsToday >= 0)
        ? Math.floor(data.focusMinsToday) : 0;
      state.streak         = (typeof data.streak === 'number' && data.streak >= 0)
        ? Math.floor(data.streak) : 0;
      state.lastDate       = typeof data.lastDate === 'string' ? data.lastDate : '';
    }

    // Tarefas — muta in-place
    const rawTasks = localStorage.getItem(TASKS_KEY);
    if (rawTasks) {
      const parsed = JSON.parse(rawTasks);
      const sanitized = _sanitizeTasks(parsed);
      tasks.length = 0;
      tasks.push(...sanitized);
      // Restaura activeTaskId para a primeira tarefa não concluída
      const firstActive = tasks.find(t => !t.done);
      activeTaskId = firstActive ? firstActive.id : null;
    }

  } catch (e) {
    console.warn('[foco] Erro ao carregar dados:', e);
    // Garante estado limpo se o parse falhar completamente
    settings     = { ...DEFAULT_SETTINGS };
    tasks.length   = 0;
    history.length = 0;
  }
}

/**
 * Persiste settings, histórico (limitado), stats e tarefas.
 * Também trunca o array history em memória para manter consistência.
 */
function savePersisted() {
  try {
    // Trunca history em memória antes de salvar (FIX: antes só truncava no JSON)
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
 * Reseta contadores diários usando state.lastDate (já em memória),
 * sem releitura do localStorage.
 *
 * Regra de streak:
 * - Se a última sessão foi HOJE → mantém streak (já incrementado em timer.js)
 * - Se a última sessão foi ONTEM → mantém streak (usuário continua a sequência)
 * - Se a última sessão foi há 2+ dias → zera streak (sequência quebrada)
 */
function checkDate() {
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const last      = state.lastDate;

  if (!last || last === today) return; // primeiro uso ou mesmo dia

  // Zera contadores diários independente do caso
  state.completedToday = 0;
  state.focusMinsToday = 0;

  // Zera streak se a sequência foi quebrada (FIX: antes nunca zerava)
  if (last !== yesterday) {
    state.streak = 0;
  }

  // Atualiza lastDate em memória para evitar reset duplo na mesma sessão
  state.lastDate = today;
}

/**
 * Retorna a duração em segundos para um dado modo.
 * Retorna o modo 'work' como fallback se mode for inválido
 * para evitar NaN no timer (FIX: antes retornava undefined * 60).
 * @param {'work'|'short'|'long'} mode
 * @returns {number}
 */
function getDuration(mode) {
  const durationMap = {
    work:  settings.workMins,
    short: settings.shortMins,
    long:  settings.longMins
  };
  const mins = durationMap[mode];
  if (typeof mins !== 'number' || !isFinite(mins)) {
    console.warn(`[foco] getDuration: modo inválido "${mode}", usando 'work' como fallback.`);
    return settings.workMins * 60;
  }
  return mins * 60;
}