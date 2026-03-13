/* =========================================================
   sound.js — Áudio via Web Audio API e controle de som
   =========================================================
   Depende de: state.js, ui.js (showToast)
   ========================================================= */

let audioCtx     = null;
let soundEnabled = true;

// ─── Inicialização ───────────────────────────────────────

/**
 * Cria (ou reutiliza) o AudioContext.
 * Deve ser chamado após interação do usuário para satisfazer
 * a política de autoplay dos browsers modernos.
 */
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// ─── Primitiva de tom ────────────────────────────────────

/**
 * Toca um tom sintético via oscilador.
 * @param {number} freq  Frequência em Hz
 * @param {number} dur   Duração em segundos
 * @param {string} type  Tipo do oscilador ('sine'|'square'|'triangle'|'sawtooth')
 * @param {number} vol   Volume inicial (0–1)
 */
function playTone(freq, dur, type = 'sine', vol = 0.3) {
  try {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);

    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + dur);
  } catch (e) {
    // Falha silenciosa — áudio não é essencial
  }
}

// ─── Sons compostos ──────────────────────────────────────

/**
 * Toca um efeito sonoro nomeado.
 * @param {'complete'|'break_end'} type
 */
function playSound(type) {
  if (!soundEnabled) return;

  if (type === 'complete') {
    // Acorde ascendente (Dó-Mi-Sol)
    playTone(523, 0.15, 'sine', 0.25);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.25), 160);
    setTimeout(() => playTone(784, 0.30, 'sine', 0.25), 320);
  } else if (type === 'break_end') {
    // Dois tons suaves de aviso
    playTone(440, 0.20, 'sine', 0.20);
    setTimeout(() => playTone(554, 0.40, 'sine', 0.20), 220);
  }
}

// ─── Toggle de som ───────────────────────────────────────

/** Ativa/desativa o som e atualiza o ícone no botão. */
function toggleSound() {
  soundEnabled = !soundEnabled;

  const btn = document.getElementById('soundBtn');
  btn.classList.toggle('active', !soundEnabled);

  // Troca o SVG do ícone
  const iconEl = document.getElementById('soundIcon');
  if (soundEnabled) {
    iconEl.outerHTML = `
      <svg id="soundIcon" width="15" height="15" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
      </svg>`;
  } else {
    iconEl.outerHTML = `
      <svg id="soundIcon" width="15" height="15" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
        <line x1="23" y1="9" x2="17" y2="15"/>
        <line x1="17" y1="9" x2="23" y2="15"/>
      </svg>`;
  }

  showToast(soundEnabled ? '🔊' : '🔇', soundEnabled ? 'Som ativado' : 'Som desativado');
}