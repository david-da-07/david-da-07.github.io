const COLOR_PALETTE = {
  blue: { name: 'Azul', hex: '#3b82f6' },
  purple: { name: 'Púrpura', hex: '#a855f7' },
  green: { name: 'Verde', hex: '#10b981' },
  amber: { name: 'Amarillo', hex: '#f59e0b' },
  red: { name: 'Rojo', hex: '#ef4444' },
  pink: { name: 'Rosa', hex: '#ec4899' },
  slate: { name: 'Gris Oscuro', hex: '#475569' },
  white: { name: 'Blanco', hex: '#cbd5e1' }
};

let projectTitle = "";
let selectedTaskColor = 'blue';
let currentThemeStyle = 'gray';
let tasks = [];

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  renderColorPicker();
  setThemeStyle('gray');
  renderApp();
});

function toggleThemeMode() {
  const htmlEl = document.documentElement;
  if (htmlEl.classList.contains('dark')) {
    htmlEl.classList.remove('dark');
    htmlEl.classList.add('light');
  } else {
    htmlEl.classList.remove('light');
    htmlEl.classList.add('dark');
  }
}

function setThemeStyle(styleKey) {
  currentThemeStyle = styleKey;
  document.body.classList.remove('theme-gray', 'theme-blue', 'theme-green', 'theme-pink', 'theme-yellow', 'theme-white');
  document.body.classList.add(`theme-${styleKey}`);

  ['gray', 'blue', 'green', 'pink', 'yellow', 'white'].forEach(k => {
    const btn = document.getElementById(`btnTheme-${k}`);
    if (btn) {
      if (k === styleKey) {
        btn.className = "px-3 py-1.5 rounded-xl text-xs font-semibold border border-accent-500 bg-accent-500 text-white shadow-sm transition flex items-center gap-1.5";
      } else {
        btn.className = "px-3 py-1.5 rounded-xl text-xs font-medium border border-accent-500/20 hover:bg-accent-500/10 text-slate-600 dark:text-slate-300 transition flex items-center gap-1.5";
      }
    }
  });

  renderWebGantt();
}

function updateProjectTitle(newTitle) {
  projectTitle = newTitle || "";
  renderWebGantt();
}

function renderColorPicker() {
  const container = document.getElementById('colorPickerContainer');
  container.innerHTML = Object.keys(COLOR_PALETTE).map(key => {
    const col = COLOR_PALETTE[key];
    const isSelected = key === selectedTaskColor;
    return `
      <button type="button" onclick="selectTaskColor('${key}')" 
              class="h-8 rounded-lg flex items-center justify-center border transition-all ${
                isSelected ? 'border-white ring-1 ring-accent-500 scale-105 shadow-sm' : 'border-transparent opacity-80 hover:opacity-100'
              }" style="background-color: ${col.hex}; color: #ffffff">
        ${isSelected ? '<i data-lucide="check" class="w-3.5 h-3.5 text-white drop-shadow-sm"></i>' : ''}
      </button>
    `;
  }).join('');
  lucide.createIcons();
}

function selectTaskColor(key) {
  selectedTaskColor = key;
  renderColorPicker();
}

function renderApp() {
  tasks.sort((a, b) => new Date(a.start) - new Date(b.start));
  document.getElementById('taskCount').innerText = tasks.length;
  renderTable();
  renderWebGantt();
}

function renderTable() {
  const tbody = document.getElementById('taskTableBody');
  if (tasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-slate-400 italic font-normal">No hay tareas creadas. Completa el formulario para comenzar.</td></tr>`;
    return;
  }

  tbody.innerHTML = tasks.map(t => {
    const col = COLOR_PALETTE[t.color] || COLOR_PALETTE.blue;
    return `
      <tr class="hover:bg-slate-50 dark:hover:bg-slate-950/60 transition">
        <td class="py-2.5 px-3"><span class="inline-block w-2.5 h-2.5 rounded-full shadow-sm" style="background-color: ${col.hex}"></span></td>
        <td class="py-2.5 px-3">
          <div class="font-medium text-slate-800 dark:text-slate-200">${escapeHtml(t.name)}</div>
          <div class="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[200px] font-normal">${escapeHtml(t.desc || '-')}</div>
        </td>
        <td class="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">${formatDateString(t.start)}</td>
        <td class="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">${formatDateString(t.end)}</td>
        <td class="py-2.5 px-3 text-right space-x-1">
          <button onclick="editTask(${t.id})" class="p-1 text-slate-400 hover:text-accent-500 transition"><i data-lucide="pencil" class="w-3.5 h-3.5"></i></button>
          <button onclick="deleteTask(${t.id})" class="p-1 text-slate-400 hover:text-rose-500 transition"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
        </td>
      </tr>
    `;
  }).join('');
  lucide.createIcons();
}

function renderWebGantt() {
  const container = document.getElementById('webGanttContainer');
  const dateBadge = document.getElementById('dateRangeBadge');

  if (tasks.length === 0) {
    container.innerHTML = `<div class="py-12 text-center text-slate-400 text-xs italic font-normal">Agrega la primera tarea para visualizar el cronograma interactivo.</div>`;
    dateBadge.innerText = '-- / --';
    return;
  }

  const dates = tasks.flatMap(t => [new Date(t.start + 'T00:00:00'), new Date(t.end + 'T00:00:00')]);
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  dateBadge.innerText = `${formatDateShort(minDate)} - ${formatDateShort(maxDate)}`;

  const daysArray = [];
  let current = new Date(minDate);
  while (current <= maxDate) {
    daysArray.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const totalDays = daysArray.length;

  const weeks = [];
  let currentWeek = { number: 1, days: [] };
  daysArray.forEach((d, i) => {
    currentWeek.days.push(d);
    if (d.getDay() === 0 || i === daysArray.length - 1) {
      weeks.push(currentWeek);
      currentWeek = { number: weeks.length + 1, days: [] };
    }
  });

  container.innerHTML = `
    <div class="space-y-4">
      <div class="grid grid-cols-12 gap-0 border-b border-accent-500/15 pb-2">
        <div class="col-span-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide self-end pb-1">Tarea / Responsable</div>
        <div class="col-span-9 flex flex-col">
          <div class="flex border-b border-accent-500/15 pb-1 mb-1">
            ${weeks.map(w => `<div class="text-[10px] font-semibold text-accent-500 text-center truncate" style="width: ${(w.days.length / totalDays) * 100}\%">Semana ${w.number}</div>`).join('')}
          </div>
          <div class="flex">
            ${daysArray.map(d => {
              const dayName = ['D','L','M','X','J','V','S'][d.getDay()];
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              return `
                <div class="flex-1 text-center text-[9px] font-mono ${isWeekend ? 'text-slate-400 bg-slate-100/50 dark:bg-slate-900/40' : 'text-slate-600 dark:text-slate-400'}">
                  <div>${dayName}</div>
                  <div class="font-medium text-[10px] text-slate-700 dark:text-slate-300">${d.getDate()}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="space-y-3">
        ${tasks.map(t => {
          const start = new Date(t.start + 'T00:00:00');
          const end = new Date(t.end + 'T00:00:00');

          const offsetDays = Math.max(0, Math.round((start - minDate) / (1000 * 60 * 60 * 24)));
          const durationDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

          const leftPercent = (offsetDays / totalDays) * 100;
          const widthPercent = (durationDays / totalDays) * 100;
          const col = COLOR_PALETTE[t.color] || COLOR_PALETTE.blue;

          return `
            <div class="grid grid-cols-12 gap-0 items-center hover:bg-slate-100/50 dark:hover:bg-slate-900/50 py-1.5 rounded-xl transition">
              <div class="col-span-3 pr-2">
                <div class="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">${escapeHtml(t.name)}</div>
                <div class="text-[10px] text-slate-400 dark:text-slate-500 truncate font-normal">${escapeHtml(t.desc || '')}</div>
              </div>
              <div class="col-span-9 bg-slate-100/80 dark:bg-slate-950 h-7 rounded-xl relative border border-accent-500/15 overflow-hidden flex items-center">
                <div class="absolute inset-0 flex pointer-events-none">
                  ${daysArray.map(d => `<div class="flex-1 border-r border-accent-500/10 ${d.getDay() === 0 || d.getDay() === 6 ? 'bg-slate-200/30 dark:bg-slate-800/15' : ''}"></div>`).join('')}
                </div>
                <div class="h-5 rounded-lg absolute transition-all duration-300 shadow-sm flex items-center px-2"
                     style="left: ${leftPercent}%; width: ${widthPercent}\%; background-color:${col.hex}">
                  <span class="text-[9px] font-medium text-white truncate drop-shadow-sm">${escapeHtml(t.name)}</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function handleTaskFormSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('taskIdInput').value;
  const name = document.getElementById('taskNameInput').value.trim();
  const desc = document.getElementById('taskDescInput').value.trim();
  const start = document.getElementById('taskStartInput').value;
  const end = document.getElementById('taskEndInput').value;

  if (new Date(start) > new Date(end)) {
    alert('La fecha de fin debe ser posterior a la de inicio.');
    return;
  }

  if (id) {
    tasks = tasks.map(t => t.id == id ? { id: Number(id), name, desc, start, end, color: selectedTaskColor } : t);
  } else {
    tasks.push({ id: Date.now(), name, desc, start, end, color: selectedTaskColor });
  }

  resetTaskForm();
  renderApp();
}

function editTask(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;

  document.getElementById('taskIdInput').value = t.id;
  document.getElementById('taskNameInput').value = t.name;
  document.getElementById('taskDescInput').value = t.desc || '';
  document.getElementById('taskStartInput').value = t.start;
  document.getElementById('taskEndInput').value = t.end;
  selectedTaskColor = t.color || 'blue';

  document.getElementById('formHeading').innerText = 'Editar Tarea';
  document.getElementById('btnSubmitForm').innerText = 'Actualizar Tarea';
  document.getElementById('btnCancelForm').classList.remove('hidden');
  document.getElementById('editBadge').classList.remove('hidden');

  renderColorPicker();
}

function deleteTask(id) {
  if (confirm('¿Deseas eliminar esta tarea?')) {
    tasks = tasks.filter(t => t.id !== id);
    renderApp();
  }
}

function clearAllTasks() {
  if (confirm('¿Deseas eliminar TODAS las tareas?')) {
    tasks = [];
    renderApp();
  }
}

function resetTaskForm() {
  document.getElementById('taskForm').reset();
  document.getElementById('taskIdInput').value = '';
  document.getElementById('formHeading').innerText = 'Nueva Tarea';
  document.getElementById('btnSubmitForm').innerText = 'Guardar Tarea';
  document.getElementById('btnCancelForm').classList.add('hidden');
  document.getElementById('editBadge').classList.add('hidden');
  selectedTaskColor = 'blue';
  renderColorPicker();
}

function exportJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ title: projectTitle, tasks }, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `proyecto_gantt_${formatDateFile(new Date())}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

function importJSON(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const parsed = JSON.parse(e.target.result);
      if (Array.isArray(parsed)) {
        tasks = parsed;
      } else if (parsed.tasks && Array.isArray(parsed.tasks)) {
        tasks = parsed.tasks;
        projectTitle = parsed.title || "";
        document.getElementById('projectTitleInput').value = projectTitle;
      }
      renderApp();
      alert('Proyecto cargado correctamente.');
    } catch (err) {
      alert('Error al leer el archivo JSON.');
    }
  };
  reader.readAsText(file);
}

// EXPORTACIÓN PDF A4 CON ENCABEZADO SUPERIOR Y LEYENDA INFERIOR
function exportPDF() {
  if (tasks.length === 0) {
    alert('Agrega al menos una tarea antes de exportar el PDF.');
    return;
  }

  const pagesContainer = document.getElementById('pdfPagesRenderArea');
  pagesContainer.innerHTML = '';

  const dates = tasks.flatMap(t => [new Date(t.start + 'T00:00:00'), new Date(t.end + 'T00:00:00')]);
  const globalMin = new Date(Math.min(...dates));
  const globalMax = new Date(Math.max(...dates));

  const startDate = new Date(globalMin);
  const dayOfWeek = startDate.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startDate.setDate(startDate.getDate() + diffToMonday);

  const DAYS_PER_PAGE = 28;
  const MAX_TASKS_PER_PAGE = 7;

  const timeWindows = [];
  let wStart = new Date(startDate);
  while (wStart <= globalMax) {
    const wEnd = new Date(wStart);
    wEnd.setDate(wEnd.getDate() + DAYS_PER_PAGE - 1);
    timeWindows.push({ start: new Date(wStart), end: wEnd });
    wStart.setDate(wStart.getDate() + DAYS_PER_PAGE);
  }

  const pageList = [];
  timeWindows.forEach(window => {
    const windowTasks = tasks.filter(t => {
      const tStart = new Date(t.start + 'T00:00:00');
      const tEnd = new Date(t.end + 'T00:00:00');
      return tStart <= window.end && tEnd >= window.start;
    });

    const taskChunks = [];
    for (let i = 0; i < windowTasks.length; i += MAX_TASKS_PER_PAGE) {
      taskChunks.push(windowTasks.slice(i, i + MAX_TASKS_PER_PAGE));
    }
    if (taskChunks.length === 0) taskChunks.push([]);

    taskChunks.forEach(chunk => {
      pageList.push({
        window,
        tasks: chunk
      });
    });
  });

  const totalPages = pageList.length;

  pageList.forEach((pageData, pIdx) => {
    const pageDays = [];
    let dCursor = new Date(pageData.window.start);
    for (let i = 0; i < DAYS_PER_PAGE; i++) {
      pageDays.push(new Date(dCursor));
      dCursor.setDate(dCursor.getDate() + 1);
    }

    const pageEl = document.createElement('div');
    pageEl.className = 'pdf-render-page';

    pageEl.innerHTML = `
      <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
        
        <!-- ENCABEZADO FIJO AL MARGEN SUPERIOR -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; margin-bottom: 12px;">
            <div>
              <h1 style="font-size: 15px; font-weight: 700; color: #0f172a; text-transform: uppercase; margin: 0; font-family: sans-serif;">
                ${escapeHtml(projectTitle || 'PROYECTO')}
              </h1>
              <p style="font-size: 10px; color: #64748b; margin: 2px 0 0 0; font-weight: 500;">
                Período: ${formatDateShort(pageData.window.start)} al ${formatDateShort(pageData.window.end)} (4 Semanas)
              </p>
            </div>
            <div style="background-color: #f8fafc; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 600; color: #334155; border: 1px solid #e2e8f0;">
              PÁGINA ${pIdx + 1} DE ${totalPages}
            </div>
          </div>

          <!-- DIAGRAMA -->
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <thead>
              <tr style="border-bottom: 1px solid #cbd5e1; background-color: #f8fafc;">
                <th style="width: 210px; text-align: left; padding: 6px 8px; font-size: 10px; font-weight: 600; color: #334155;">
                  TAREA / RESP.
                </th>
                ${[1, 2, 3, 4].map(wNum => `
                  <th colspan="7" style="text-align: center; padding: 4px 0; font-size: 9.5px; font-weight: 600; color: #2563eb; border-left: 1px solid #cbd5e1;">
                    SEMANA ${wNum}
                  </th>
                `).join('')}
              </tr>

              <tr style="border-bottom: 1px solid #94a3b8;">
                <th style="width: 210px; padding: 4px 8px; text-align: left; font-size: 8.5px; color: #64748b; font-weight: 400;">Descripción</th>
                ${pageDays.map((d, idx) => `
                  <th style="padding: 3px 0; text-align: center; font-size: 8.5px; font-family: monospace; font-weight: 500; color: #475569; ${idx % 7 === 0 ? 'border-left: 1px solid #cbd5e1;' : ''}">
                    <div>${['D','L','M','X','J','V','S'][d.getDay()]}</div>
                    <div style="font-weight: 600; color: #0f172a;">${d.getDate()}</div>
                  </th>
                `).join('')}
              </tr>
            </thead>

            <tbody>
              ${pageData.tasks.map(t => {
                const tStart = new Date(t.start + 'T00:00:00');
                const tEnd = new Date(t.end + 'T00:00:00');
                const col = COLOR_PALETTE[t.color] || COLOR_PALETTE.blue;

                return `
                  <tr style="border-bottom: 1px solid #e2e8f0; height: 38px;">
                    <td style="width: 210px; padding: 4px 8px; vertical-align: middle;">
                      <div style="font-size: 10px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 190px;">
                        ${escapeHtml(t.name)}
                      </div>
                      <div style="font-size: 8.5px; color: #64748b; font-weight: 400; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 190px;">
                        ${escapeHtml(t.desc || '')}
                      </div>
                    </td>

                    ${pageDays.map((d, dIdx) => {
                      const inRange = d >= tStart && d <= tEnd;
                      const isStart = d.getTime() === tStart.getTime();
                      const isEnd = d.getTime() === tEnd.getTime();

                      return `
                        <td style="padding: 2px 1px; vertical-align: middle; ${dIdx % 7 === 0 ? 'border-left: 1px solid #e2e8f0;' : ''}">
                          ${inRange ? `
                            <div style="
                              height: 18px; 
                              background-color: ${col.hex};${isStart ? 'border-top-left-radius: 4px; border-bottom-left-radius: 4px;' : ''}
                              ${isEnd ? 'border-top-right-radius: 4px; border-bottom-right-radius: 4px;' : ''}
                            "></div>
                          ` : ''}
                        </td>
                      `;
                    }).join('')}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- LEYENDA FIJA AL MARGEN INFERIOR -->
        <div style="border-top: 1px solid #cbd5e1; padding-top: 8px; margin-top: auto; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <span style="font-size: 9px; font-weight: 600; color: #334155; text-transform: uppercase;">LEYENDA:</span>
            ${Object.keys(COLOR_PALETTE).map(k => {
              const c = COLOR_PALETTE[k];
              if (!pageData.tasks.some(x => x.color === k)) return '';
              return `
                <div style="display: flex; align-items: center; gap: 4px;">
                  <span style="width: 8px; height: 8px; border-radius: 2px; background-color: ${c.hex}; display: inline-block;"></span>
                  <span style="font-size: 8.5px; font-weight: 500; color: #475569;">${c.name}</span>
                </div>
              `;
            }).join('')}
          </div>

          <div style="font-size: 8.5px; font-weight: 500; color: #94a3b8;">Gantt Studio</div>
        </div>

      </div>
    `;

    pagesContainer.appendChild(pageEl);
  });

  const opt = {
    margin: 0,
    filename: `Diagrama_Gantt_${formatDateFile(new Date())}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'pt', format: 'a4', orientation: 'landscape' }
  };

  html2pdf().set(opt).from(pagesContainer).save().then(() => {
    pagesContainer.innerHTML = '';
  });
}

function formatDateString(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

function formatDateShort(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

function formatDateFile(date) {
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}