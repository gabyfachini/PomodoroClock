/* =========================================================
   timer.js — Lógica do cronômetro e ciclo de sessões
   =========================================================
   Depende de: state.js, ui.js, sound.js
   ========================================================= */

let intervalId = null;

// ─── Controle principal ──────────────────────────────────

/** Alterna entre play e pause. */
function toggleTimer() {
  if (state.running) pauseTimer();
  else startTimer();
}

/** Inicia o timer. */
function startTimer() {
  if (state.running) return;
  state.running = true;
  document.getElementById('ringSvg').classList.add('running');
  setPlayIcon(true);
  intervalId = setInterval(tick, 1000);
  updateTitle();
  requestWakeLock();
}

/** Pausa sem resetar o tempo. */
function pauseTimer() {
  state.running = false;
  clearInterval(intervalId);
  document.getElementById('ringSvg').classList.remove('running');
  setPlayIcon(false);
  updateTitle();
}

/** Para e reseta o tempo da sessão atual. */
function stopTimer() {
  pauseTimer();
  state.remaining = getDuration(state.mode);
  renderTimer();
  renderRing();
}

/** Reinicia o timer (UI). */
function resetTimer() {
  stopTimer();
  showToast('⏱', 'Timer reiniciado');
}

/** Pula para a próxima sessão sem contabilizar. */
function skipSession() {
  stopTimer();
  advanceSession();
  showToast('⏭', 'Sessão pulada');
}

// ─── Tick e conclusão ────────────────────────────────────

/** Executado a cada segundo enquanto o timer corre. */
function tick() {
  state.remaining--;

  if (state.remaining <= 0) {
    sessionComplete();
  } else {
    renderTimer();
    renderRing();
    updateTitle();
  }
}

/** Chamado ao fim de uma sessão (work ou pausa). */
function sessionComplete() {
  stopTimer();
  state.remaining = 0;
  renderTimer();
  renderRing();

  // Animação de flash no display
  const display = document.getElementById('timerDisplay');
  display.classList.add('flash-anim');
  setTimeout(() => display.classList.remove('flash-anim'), 700);

  if (state.mode === 'work') {
    _onWorkComplete();
  } else {
    _onBreakComplete();
  }
}

/** Lida com o fim de uma sessão de foco. */
function _onWorkComplete() {
  const mins = settings.workMins;

  // Atualiza stats
  state.completedToday++;
  state.focusMinsToday += mins;
  state.streak++;

  // Incrementa pomodoro da tarefa ativa
  if (activeTaskId !== null) {
    const t = tasks.find(t => t.id === activeTaskId);
    if (t) t.pomos = (t.pomos || 0) + 1;
  }

  // Salva no histórico
  const activeTask = tasks.find(t => t.id === activeTaskId);
  history.push({
    date:  new Date().toISOString(),
    label: activeTask ? activeTask.text : 'Sessão de foco',
    mins
  });

  savePersisted();
  renderStats();
  renderTasks();
  playSound('complete');
  showToast('🍅', `Pomodoro ${state.completedToday} completo! Hora de descansar.`);
  notify('Pomodoro Completo! 🍅', 'Hora de uma pausa.');

  // Determina próximo modo
  const nextMode = (state.session >= settings.sessionsPerCycle) ? 'long' : 'short';

  if (state.session >= settings.sessionsPerCycle) {
    state.session = 1;
  } else {
    state.session++;
  }

  renderDots();
  switchMode(nextMode);

  if (settings.autoBreak) setTimeout(startTimer, 1200);
}

/** Lida com o fim de uma pausa. */
function _onBreakComplete() {
  playSound('break_end');
  showToast('💪', 'Pausa encerrada. Vamos focar!');
  notify('Pausa Encerrada', 'Hora de voltar ao foco!');
  switchMode('work');

  if (settings.autoWork) setTimeout(startTimer, 1200);
}

// ─── Mudança de modo e ciclo ─────────────────────────────

/**
 * Muda o modo do timer (work / short / long).
 * Para o timer se estiver rodando.
 * @param {'work'|'short'|'long'} mode
 */
function switchMode(mode) {
  if (state.running) stopTimer();
  state.mode = mode;
  state.remaining = getDuration(mode);
  updateAccent();
  renderTimer();
  renderTabs();
  renderRing();
}

/** Avança para a próxima sessão na ordem natural do ciclo. */
function advanceSession() {
  if (state.mode === 'work') {
    if (state.session >= settings.sessionsPerCycle) {
      state.session = 1;
      switchMode('long');
    } else {
      state.session++;
      switchMode('short');
    }
  } else {
    switchMode('work');
  }
  renderDots();
}

// ─── Wake Lock ────────────────────────────────────────────
let wakeLock = null;

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) {
      wakeLock = await navigator.wakeLock.request('screen');
    }
  } catch (e) {}
}

document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && state.running) {
    await requestWakeLock();
  }
});