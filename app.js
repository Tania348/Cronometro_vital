/**
 * Cronómetro Vital: Guía de Código Azul
 * Asistente inteligente de tiempos e intervenciones para emergencias médicas.
 */

// Estado global de la aplicación
const state = {
  isRunning: true,
  masterSeconds: 0,
  cycleRemainingSeconds: 120, // 2 minutos (120 seg)
  cycleNumber: 1,
  cyclesCompleted: 0,
  startTime: null,

  // Contadores clínicos
  shocksCount: 0,
  adrenalinaCount: 0, // en mg
  amiodaronaTotal: 0, // en mg
  amioDosis1Time: null,
  amioDosis2Time: null,

  // Tiempos relativos del último evento (en masterSeconds)
  lastAdrenalinaMasterSec: null,
  lastShockMasterSec: null,
  lastAmioMasterSec: null,

  // Registro de eventos (Bitácora)
  events: [],

  // Filtro activo de la bitácora
  activeFilter: 'all'
};

// Referencias del temporizador
let masterInterval = null;
let lastTimestamp = Date.now();

// Inicialización de la aplicación
window.addEventListener('DOMContentLoaded', () => {
  state.startTime = new Date();
  lastTimestamp = Date.now();
  const timeStr = state.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const timeStartedEl = document.getElementById('time-started');
  if (timeStartedEl) timeStartedEl.textContent = timeStr;

  // Registrar evento inicial de inicio de Código Azul
  addEventToLog({
    title: 'Inicio de Código Azul',
    detail: 'Cronómetro maestro iniciado • Compresiones Ciclo #1 en curso',
    icon: 'play_arrow',
    category: 'cycle',
    color: 'secondary'
  });

  // Iniciar el reloj de 1 segundo
  startTimer();

  // Renderizar vistas
  renderUI();
});

// Sincronización al regresar a la pestaña en el celular
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && state.isRunning) {
    const now = Date.now();
    const deltaMs = now - lastTimestamp;
    if (deltaMs >= 1000) {
      const deltaSec = Math.floor(deltaMs / 1000);
      lastTimestamp += deltaSec * 1000;
      state.masterSeconds += deltaSec;
      if (state.cycleRemainingSeconds > 0) {
        state.cycleRemainingSeconds = Math.max(0, state.cycleRemainingSeconds - deltaSec);
      }
      renderTimers();
      renderUI();
    }
  }
});

// Inicia el loop del temporizador con sincronización horaria real
function startTimer() {
  if (masterInterval) clearInterval(masterInterval);
  state.isRunning = true;
  lastTimestamp = Date.now();
  updateTimerControlsUI();

  masterInterval = setInterval(() => {
    if (!state.isRunning) {
      lastTimestamp = Date.now();
      return;
    }

    const now = Date.now();
    const deltaMs = now - lastTimestamp;
    if (deltaMs >= 1000) {
      const deltaSec = Math.floor(deltaMs / 1000);
      lastTimestamp += deltaSec * 1000;

      // Incrementar reloj maestro
      state.masterSeconds += deltaSec;

      // Decrementar ciclo de 2 min
      if (state.cycleRemainingSeconds > 0) {
        state.cycleRemainingSeconds = Math.max(0, state.cycleRemainingSeconds - deltaSec);
      }

      renderTimers();
    }
  }, 250);
}

// Alternar entre Pausa y Reanudar
function toggleTimer() {
  state.isRunning = !state.isRunning;
  updateTimerControlsUI();

  const badgeMasterStatus = document.getElementById('badge-master-status');
  if (badgeMasterStatus) {
    if (state.isRunning) {
      badgeMasterStatus.textContent = 'EN CURSO';
      badgeMasterStatus.className = 'text-[11px] font-mono px-2 py-0.5 rounded bg-surface-high text-primary font-bold border border-primary/20';
      addEventToLog({
        title: 'Cronómetro Reanudado',
        detail: 'Reanudación de tiempos del Código Azul',
        icon: 'play_arrow',
        category: 'cycle',
        color: 'secondary'
      });
    } else {
      badgeMasterStatus.textContent = 'PAUSADO';
      badgeMasterStatus.className = 'text-[11px] font-mono px-2 py-0.5 rounded bg-secondary/20 text-secondary font-bold border border-secondary/30';
      addEventToLog({
        title: 'Cronómetro en Pausa',
        detail: 'Pausa momentánea en la reanimación',
        icon: 'pause',
        category: 'cycle',
        color: 'secondary'
      });
    }
  }
}

function updateTimerControlsUI() {
  const iconToggle = document.getElementById('icon-toggle-timer');
  const lblToggle = document.getElementById('lbl-toggle-timer');
  if (iconToggle && lblToggle) {
    if (state.isRunning) {
      iconToggle.textContent = 'pause';
      lblToggle.textContent = 'Pausar';
    } else {
      iconToggle.textContent = 'play_arrow';
      lblToggle.textContent = 'Reanudar';
    }
  }
}

// Reiniciar / Nuevo Código Azul
function confirmReset() {
  const answer = confirm('¿Deseas finalizar este Código Azul e iniciar uno nuevo desde cero?');
  if (answer) {
    state.masterSeconds = 0;
    state.cycleRemainingSeconds = 120;
    state.cycleNumber = 1;
    state.cyclesCompleted = 0;
    state.shocksCount = 0;
    state.adrenalinaCount = 0;
    state.amiodaronaTotal = 0;
    state.amioDosis1Time = null;
    state.amioDosis2Time = null;
    state.lastAdrenalinaMasterSec = null;
    state.lastShockMasterSec = null;
    state.lastAmioMasterSec = null;
    state.events = [];
    state.startTime = new Date();

    const timeStr = state.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const timeStartedEl = document.getElementById('time-started');
    if (timeStartedEl) timeStartedEl.textContent = timeStr;

    addEventToLog({
      title: 'Nuevo Código Azul Inicializado',
      detail: 'Tiempo reseteado a 00:00 • Ciclo #1 en curso',
      icon: 'restart_alt',
      category: 'cycle',
      color: 'secondary'
    });

    startTimer();
    renderUI();
  }
}

// Función MARCAR: Completar ciclo de 2 minutos
function completeCycle() {
  state.cyclesCompleted++;
  const finishedCycle = state.cycleNumber;
  state.cycleNumber++;
  state.cycleRemainingSeconds = 120; // reiniciar a 2 minutos

  addEventToLog({
    title: `Ciclo RCP #${finishedCycle} Completado`,
    detail: '2 minutos finalizados • Cambio de compresor y verificación de ritmo',
    icon: 'sync',
    category: 'cycle',
    color: 'secondary'
  });

  renderUI();
}

// Función ANOTAR: Registro de Adrenalina 1mg
function registerAdrenalina() {
  state.adrenalinaCount += 1;
  state.lastAdrenalinaMasterSec = state.masterSeconds;

  addEventToLog({
    title: `Adrenalina 1mg I.V./I.O. (Dosis #${state.adrenalinaCount})`,
    detail: 'Bolo administrado + lavado de 20ml de solución salina • Ventana 3-5 min activa',
    icon: 'vaccines',
    category: 'drug',
    color: 'tertiary'
  });

  renderUI();
}

// Función ANOTAR: Registro general de eventos
function registerEvent(title, detail, icon, color) {
  let category = 'other';
  if (title.toLowerCase().includes('desfibril') || title.toLowerCase().includes('shock')) {
    category = 'shock';
    state.shocksCount++;
    state.lastShockMasterSec = state.masterSeconds;
  } else if (title.toLowerCase().includes('adrenalina') || title.toLowerCase().includes('amiodarona') || title.toLowerCase().includes('fármaco')) {
    category = 'drug';
    if (title.includes('300mg')) {
      state.amiodaronaTotal += 300;
      state.amioDosis1Time = formatTime(state.masterSeconds);
      state.lastAmioMasterSec = state.masterSeconds;
    } else if (title.includes('150mg')) {
      state.amiodaronaTotal += 150;
      state.amioDosis2Time = formatTime(state.masterSeconds);
      state.lastAmioMasterSec = state.masterSeconds;
    }
  } else if (title.toLowerCase().includes('ritmo') || title.toLowerCase().includes('rce')) {
    category = 'rhythm';
  }

  addEventToLog({
    title,
    detail,
    icon,
    category,
    color
  });

  renderUI();
}

// Agregar evento a la bitácora
function addEventToLog({ title, detail, icon, category, color }) {
  const now = new Date();
  const realTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const eventTime = formatTime(state.masterSeconds);

  const eventItem = {
    id: Date.now() + Math.random(),
    title,
    detail,
    icon,
    category,
    color,
    eventTime,
    realTime,
    masterSec: state.masterSeconds
  };

  state.events.unshift(eventItem); // El más reciente primero
  renderTimelineStreams();
}

// Formateador de segundos a MM:SS
function formatTime(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined || totalSeconds < 0) return '--:--';
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Renderizado de temporizadores por segundo
function renderTimers() {
  // 1. Reloj Maestro
  const displayMaster = document.getElementById('display-master');
  if (displayMaster) {
    displayMaster.textContent = formatTime(state.masterSeconds);
  }

  // 2. Reloj de Ciclo (2 min)
  const displayCycle = document.getElementById('display-cycle');
  const displayCycleSec = document.getElementById('display-cycle-seconds');
  const circleProgress = document.getElementById('circle-cycle-progress');
  const cardCprCycle = document.getElementById('card-cpr-cycle');
  const badgeCycleAlert = document.getElementById('badge-cycle-alert');
  const textCycleAlert = document.getElementById('text-cycle-alert');
  const cycleInstruction = document.getElementById('cycle-instruction');

  const remSec = state.cycleRemainingSeconds;

  if (displayCycle) displayCycle.textContent = formatTime(remSec);
  if (displayCycleSec) displayCycleSec.textContent = `${remSec}s`;

  // Porcentaje de progreso del círculo SVG (de 100 a 0)
  if (circleProgress) {
    const pct = Math.max(0, Math.min(100, (remSec / 120) * 100));
    circleProgress.setAttribute('stroke-dasharray', `${pct}, 100`);
  }

  // ALERTA VISUAL POR COLORES (100% SILENCIOSA)
  if (cardCprCycle && badgeCycleAlert && textCycleAlert && cycleInstruction) {
    if (remSec === 0) {
      // TIEMPO CUMPLIDO: ROJO VIVO PARPADEANTE
      cardCprCycle.className = 'md:col-span-7 bg-red-950/40 rounded-2xl p-4 sm:p-5 border-2 border-primary flex flex-col justify-between relative overflow-hidden shadow-2xl transition-all duration-300 animate-pulse';
      badgeCycleAlert.className = 'px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-wider bg-primary text-white border border-primary flex items-center gap-1';
      textCycleAlert.textContent = '¡2 MINUTOS CUMPLIDOS! VERIFICAR RITMO';
      cycleInstruction.textContent = '¡Detener compresiones brevemente, evaluar ritmo y cambiar compresor!';
      cycleInstruction.className = 'text-xs sm:text-sm font-mono text-primary font-bold mt-1';
      if (circleProgress) circleProgress.className.baseVal = 'text-primary transition-all duration-300';
    } else if (remSec <= 15) {
      // ÚLTIMOS 15 SEGUNDOS: ÁMBAR/NARANJA PARPADEANTE
      cardCprCycle.className = 'md:col-span-7 bg-amber-950/30 rounded-2xl p-4 sm:p-5 border-2 border-secondary flex flex-col justify-between relative overflow-hidden shadow-xl transition-all duration-300';
      badgeCycleAlert.className = 'px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-wider bg-secondary text-background border border-secondary flex items-center gap-1 animate-pulse';
      textCycleAlert.textContent = '¡ÚLTIMOS 15 SEG! PREPARAR CAMBIO';
      cycleInstruction.textContent = 'Preparar segundo reanimador en tórax y chequeo de pulso';
      cycleInstruction.className = 'text-xs sm:text-sm font-mono text-secondary font-bold mt-1';
      if (circleProgress) circleProgress.className.baseVal = 'text-secondary transition-all duration-300';
    } else {
      // ESTADO NORMAL: VERDE / ÁMBAR SUAVE
      cardCprCycle.className = 'md:col-span-7 bg-surface-card rounded-2xl p-4 sm:p-5 border-2 border-secondary/40 flex flex-col justify-between relative overflow-hidden shadow-xl transition-all duration-300';
      badgeCycleAlert.className = 'px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-wider bg-secondary/20 text-secondary border border-secondary/30 flex items-center gap-1';
      textCycleAlert.textContent = 'COMPRESIONES EN CURSO';
      cycleInstruction.textContent = 'Mantener 100-120 CPM • Minimizar interrupciones';
      cycleInstruction.className = 'text-xs sm:text-sm font-mono text-on-surface-variant mt-1';
      if (circleProgress) circleProgress.className.baseVal = 'text-secondary transition-all duration-1000 ease-linear';
    }
  }

  // 3. Tiempos relativos "¿Cuánto hace de la última dosis?"
  updateRelativeTimers();
}

// Cálculo relativo de última dosis (Adrenalina, Shocks, Amiodarona)
function updateRelativeTimers() {
  // Adrenalina
  const txtAdrenAgo = document.getElementById('text-adrenalina-ago');
  const cardAdrenAgo = document.getElementById('card-adrenalina-ago');
  const badgeAdrenWin = document.getElementById('badge-adrenalina-window');

  if (state.lastAdrenalinaMasterSec !== null) {
    const diffSec = state.masterSeconds - state.lastAdrenalinaMasterSec;
    const diffFormatted = formatTime(diffSec);

    if (txtAdrenAgo) txtAdrenAgo.textContent = `Hace ${diffFormatted}`;
    if (cardAdrenAgo) cardAdrenAgo.textContent = diffFormatted;

    // Ventana ACLS de Adrenalina: cada 3 a 5 minutos (180s a 300s)
    if (badgeAdrenWin) {
      if (diffSec < 180) {
        badgeAdrenWin.textContent = 'EN ESPERA (<3 MIN)';
        badgeAdrenWin.className = 'text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-surface-high text-on-surface-variant';
      } else if (diffSec <= 300) {
        badgeAdrenWin.textContent = 'VENTANA ÓPTIMA (3-5 MIN)';
        badgeAdrenWin.className = 'text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-tertiary text-background animate-pulse';
      } else {
        badgeAdrenWin.textContent = 'VENTANA SUPERADA (>5 MIN)';
        badgeAdrenWin.className = 'text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-secondary text-background';
      }
    }
  } else {
    if (txtAdrenAgo) txtAdrenAgo.textContent = 'Sin dosis';
    if (cardAdrenAgo) cardAdrenAgo.textContent = '--:--';
    if (badgeAdrenWin) {
      badgeAdrenWin.textContent = 'SIN DOSIS';
      badgeAdrenWin.className = 'text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-surface-high text-on-surface-variant';
    }
  }

  // Shocks
  const cardShockAgo = document.getElementById('card-shocks-ago');
  if (cardShockAgo) {
    if (state.lastShockMasterSec !== null) {
      cardShockAgo.textContent = formatTime(state.masterSeconds - state.lastShockMasterSec);
    } else {
      cardShockAgo.textContent = '--:--';
    }
  }

  // Amiodarona
  const cardAmioAgo = document.getElementById('card-amiodarona-ago');
  if (cardAmioAgo) {
    if (state.lastAmioMasterSec !== null) {
      cardAmioAgo.textContent = formatTime(state.masterSeconds - state.lastAmioMasterSec);
    } else {
      cardAmioAgo.textContent = '--:--';
    }
  }
}

// Renderizado general de toda la interfaz
function renderUI() {
  // Contadores
  const lblCprCycle = document.getElementById('lbl-cpr-cycle');
  if (lblCprCycle) lblCprCycle.textContent = `CICLO RCP ACTUAL: #${state.cycleNumber}`;

  const cntShocks = document.getElementById('counter-shocks');
  if (cntShocks) cntShocks.textContent = state.shocksCount;

  const cntAdren = document.getElementById('counter-adrenalina');
  if (cntAdren) cntAdren.textContent = `${state.adrenalinaCount} mg`;

  const cntCyclesDone = document.getElementById('counter-cycles-done');
  if (cntCyclesDone) cntCyclesDone.textContent = state.cyclesCompleted;

  // Tarjetas de dosis
  const cardAdrenTotal = document.getElementById('card-adrenalina-total');
  if (cardAdrenTotal) cardAdrenTotal.textContent = `${state.adrenalinaCount} mg (${state.adrenalinaCount} bolo${state.adrenalinaCount === 1 ? '' : 's'})`;

  const cardAdrenLast = document.getElementById('card-adrenalina-last');
  if (cardAdrenLast && state.lastAdrenalinaMasterSec !== null) {
    cardAdrenLast.textContent = `Min ${formatTime(state.lastAdrenalinaMasterSec)}`;
  }

  const cardAmioTotal = document.getElementById('card-amiodarona-total');
  if (cardAmioTotal) cardAmioTotal.textContent = `${state.amiodaronaTotal} mg`;

  const cardAmio1 = document.getElementById('card-amio-1-time');
  if (cardAmio1 && state.amioDosis1Time) cardAmio1.textContent = state.amioDosis1Time;

  const cardAmio2 = document.getElementById('card-amio-2-time');
  if (cardAmio2 && state.amioDosis2Time) cardAmio2.textContent = state.amioDosis2Time;

  const badgeAmio = document.getElementById('badge-amiodarona-status');
  if (badgeAmio) {
    if (state.amiodaronaTotal === 0) {
      badgeAmio.textContent = 'PENDIENTE';
      badgeAmio.className = 'text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-surface-high text-on-surface-variant';
    } else if (state.amiodaronaTotal === 300) {
      badgeAmio.textContent = '1ra DOSIS PASADA (300mg)';
      badgeAmio.className = 'text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-secondary/30 text-secondary border border-secondary/40';
    } else {
      badgeAmio.textContent = 'DOSIS MÁXIMA (450mg)';
      badgeAmio.className = 'text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-success-container text-success border border-success/40';
    }
  }

  const cntShocksTotal = document.getElementById('card-shocks-total');
  if (cntShocksTotal) cntShocksTotal.textContent = state.shocksCount;

  const badgeShocks = document.getElementById('badge-shocks-status');
  if (badgeShocks) {
    badgeShocks.textContent = `${state.shocksCount} DESCARGA${state.shocksCount === 1 ? '' : 'S'}`;
    if (state.shocksCount > 0) {
      badgeShocks.className = 'text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-primary-container text-white';
    }
  }

  const cardShocksLast = document.getElementById('card-shocks-last');
  if (cardShocksLast && state.lastShockMasterSec !== null) {
    cardShocksLast.textContent = `Min ${formatTime(state.lastShockMasterSec)} (200J)`;
  }

  renderTimelineStreams();
}

// Renderizado de las listas de eventos (Previsualización y Bitácora completa)
function renderTimelineStreams() {
  const previewStream = document.getElementById('preview-event-stream');
  const fullStream = document.getElementById('full-event-stream');

  // 1. Previsualización (últimos 4 eventos)
  if (previewStream) {
    if (state.events.length === 0) {
      previewStream.innerHTML = `
        <div class="p-3 bg-surface-low rounded-lg text-center text-xs font-mono text-on-surface-variant">
          Aún no hay eventos registrados en este Código Azul. Toca cualquier botón de acción para iniciar el registro.
        </div>
      `;
    } else {
      const recent = state.events.slice(0, 4);
      previewStream.innerHTML = recent.map(ev => createEventCardHTML(ev, false)).join('');
    }
  }

  // 2. Lista completa con filtro
  if (fullStream) {
    let filtered = state.events;
    if (state.activeFilter !== 'all') {
      filtered = state.events.filter(ev => ev.category === state.activeFilter);
    }

    if (filtered.length === 0) {
      fullStream.innerHTML = `
        <div class="p-6 bg-surface-low rounded-xl text-center text-xs font-mono text-on-surface-variant">
          No hay eventos en esta categoría.
        </div>
      `;
    } else {
      fullStream.innerHTML = filtered.map(ev => createEventCardHTML(ev, true)).join('');
    }
  }
}

// Generador de tarjeta HTML para cada evento
function createEventCardHTML(ev, isFull) {
  let badgeColor = 'text-primary bg-primary/20 border-primary/30';
  if (ev.color === 'secondary') badgeColor = 'text-secondary bg-secondary/20 border-secondary/30';
  if (ev.color === 'tertiary') badgeColor = 'text-tertiary bg-tertiary/20 border-tertiary/30';
  if (ev.color === 'success') badgeColor = 'text-success bg-success/20 border-success/30';

  return `
    <div class="p-3 bg-surface-low hover:bg-surface-high border border-surface-border rounded-xl flex items-center justify-between gap-3 transition-colors">
      <div class="flex items-center gap-3">
        <span class="font-mono-timer text-sm sm:text-base font-extrabold ${badgeColor.split(' ')[0]}">
          ${ev.eventTime}
        </span>
        <div>
          <span class="text-xs sm:text-sm font-bold font-mono text-on-surface block">
            ${ev.title}
          </span>
          <span class="text-[11px] font-mono text-on-surface-variant block mt-0.5">
            ${ev.detail}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        ${isFull ? `<span class="text-[10px] font-mono text-on-surface-variant hidden sm:inline">${ev.realTime}</span>` : ''}
        <span class="material-symbols-outlined text-[20px] ${badgeColor.split(' ')[0]}">${ev.icon}</span>
      </div>
    </div>
  `;
}

// Filtrar la bitácora
function filterTimeline(filterName) {
  state.activeFilter = filterName;

  // Actualizar botones de filtro
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === filterName) {
      btn.className = 'filter-btn px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-surface-high text-primary border border-surface-border';
    } else {
      btn.className = 'filter-btn px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-surface-low text-on-surface-variant hover:text-on-surface';
    }
  });

  renderTimelineStreams();
}

// Búsqueda reactiva por texto
function handleSearch(query) {
  const container = document.getElementById('search-results-stream');
  if (!container) return;

  const q = query.trim().toLowerCase();
  if (!q) {
    container.innerHTML = '';
    return;
  }

  const results = state.events.filter(ev => 
    ev.title.toLowerCase().includes(q) ||
    ev.detail.toLowerCase().includes(q) ||
    ev.eventTime.includes(q)
  );

  if (results.length === 0) {
    container.innerHTML = `
      <div class="p-4 bg-surface-low rounded-xl text-center text-xs font-mono text-on-surface-variant">
        No se encontraron intervenciones con "${query}".
      </div>
    `;
  } else {
    container.innerHTML = results.map(ev => createEventCardHTML(ev, true)).join('');
  }
}

function clearSearch() {
  const input = document.getElementById('input-search-events');
  if (input) input.value = '';
  const container = document.getElementById('search-results-stream');
  if (container) container.innerHTML = '';
}

// Copiar reporte clínico en portapapeles
function copyAuditLog() {
  const lbl = document.getElementById('lbl-copy-report');
  
  let reportText = `========================================\n`;
  reportText += `REPORTE CLÍNICO DE CÓDIGO AZUL (ACLS)\n`;
  reportText += `Cronómetro Vital • Hospital / Urgencias\n`;
  reportText += `Fecha / Hora Inicio: ${state.startTime ? state.startTime.toLocaleString() : 'N/A'}\n`;
  reportText += `Duración Total del Paro: ${formatTime(state.masterSeconds)}\n`;
  reportText += `Ciclos de RCP Realizados: ${state.cyclesCompleted}\n`;
  reportText += `Desfibrilaciones / Shocks: ${state.shocksCount}\n`;
  reportText += `Adrenalina Total: ${state.adrenalinaCount} mg\n`;
  reportText += `Amiodarona Total: ${state.amiodaronaTotal} mg\n`;
  reportText += `========================================\n`;
  reportText += `CRONOLOGÍA SECUENCIAL DE EVENTOS:\n\n`;

  state.events.slice().reverse().forEach((ev, i) => {
    reportText += `[${ev.eventTime}] (${ev.realTime}) ${ev.title} - ${ev.detail}\n`;
  });

  reportText += `\n========================================\n`;
  reportText += `Fin del Registro • Cronometrista`;

  navigator.clipboard.writeText(reportText).then(() => {
    if (lbl) {
      lbl.textContent = '¡Copiado con Éxito!';
      setTimeout(() => {
        lbl.textContent = 'Copiar Reporte Clínico';
      }, 2500);
    }
  }).catch(() => {
    alert('Reporte copiado al portapapeles.');
  });
}

// Cambio de Pestañas (Consola / Bitácora / Filtro)
function switchTab(tabKey) {
  // Ocultar todas las vistas
  document.querySelectorAll('.tab-view').forEach(view => view.classList.add('hidden'));

  // Mostrar la elegida
  const targetView = document.getElementById(`view-${tabKey}`);
  if (targetView) targetView.classList.remove('hidden');

  // Actualizar estado en navegación desktop
  const tabs = [
    { key: 'console', btn: 'nav-btn-console', mob: 'mobile-nav-console' },
    { key: 'timeline', btn: 'nav-btn-timeline', mob: 'mobile-nav-timeline' },
    { key: 'drugs', btn: 'nav-btn-drugs', mob: 'mobile-nav-drugs' },
  ];

  tabs.forEach(t => {
    const dBtn = document.getElementById(t.btn);
    const mBtn = document.getElementById(t.mob);

    if (t.key === tabKey) {
      if (dBtn) dBtn.className = 'tab-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-surface-high text-primary border border-surface-border';
      if (mBtn) mBtn.className = 'flex flex-col items-center justify-center py-1 text-primary';
    } else {
      if (dBtn) dBtn.className = 'tab-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface';
      if (mBtn) mBtn.className = 'flex flex-col items-center justify-center py-1 text-on-surface-variant';
    }
  });

  // Re-renderizar si es necesario
  if (tabKey === 'timeline') renderTimelineStreams();
  if (tabKey === 'drugs') updateRelativeTimers();
}
