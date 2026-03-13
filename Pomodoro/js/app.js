/* =========================================================
   app.js — Ponto de entrada, inicialização e atalhos
   =========================================================
   Carregado por ÚLTIMO. Assume que todos os outros módulos
   já foram carregados e suas funções estão disponíveis.
   ========================================================= */

// ─── Inicialização ───────────────────────────────────────

/**
 * Inicializa a aplicação:
 * 1. Carrega dados persistidos
 * 2. Reseta contadores diários se necessário
 * 3. Define o tempo inicial do timer
 * 4. Renderiza toda a UI
 */
function init() {
  loadPersisted();
  checkDate();
  state.remaining = getDuration(state.mode);
  renderAll();
}

// ─── Atalhos de teclado ──────────────────────────────────

document.addEventListener('keydown', e => {
  // Ignora quando um input está focado
  if (e.target.tagName === 'INPUT') return;

  switch (e.code) {
    case 'Space':  e.preventDefault(); toggleTimer();      break;
    case 'KeyR':   resetTimer();                           break;
    case 'KeyS':   skipSession();                          break;
    case 'Digit1': switchMode('work');                     break;
    case 'Digit2': switchMode('short');                    break;
    case 'Digit3': switchMode('long');                     break;
    case 'KeyT':   toggleTheme();                          break;
  }
});

// ─── Visibilidade da aba ─────────────────────────────────

// Atualiza o título ao voltar para a aba
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && state.running) updateTitle();
});

// ─── Boot ────────────────────────────────────────────────

init();