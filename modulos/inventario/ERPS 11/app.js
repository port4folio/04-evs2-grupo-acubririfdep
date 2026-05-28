/**
 * app.js
 * Controlador principal de la interfaz — Gestión de Bodegas
 */

// ─── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initBodegas();
  initMovimientos();
  initHistorial();
  actualizarDashboard();
});

// ─── TABS ─────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + target).classList.add('active');

      if (target === 'movimientos') poblarSelectBodegas();
      if (target === 'historial')   renderHistorial();
    });
  });
}

function irTab(nombre) {
  const btn = document.querySelector(`.tab-btn[data-tab="${nombre}"]`);
  if (btn) btn.click();
}

// ─── ALERTA ──────────────────────────────────────────────────
let _alertTimer;
function showAlert(msg, tipo = 'success') {
  const el = document.getElementById('alerta');
  el.textContent = msg;
  el.className = `alerta alerta-${tipo}`;
  el.classList.remove('oculto');
  clearTimeout(_alertTimer);
  _alertTimer = setTimeout(() => el.classList.add('oculto'), 3800);
}

// ─── DASHBOARD ───────────────────────────────────────────────
function actualizarDashboard() {
  const r = getResumenGlobal();
  document.getElementById('dash-bodegas').textContent  = r.totalBodegas;
  document.getElementById('dash-unidades').textContent = r.totalUnidades;
  document.getElementById('dash-movs').textContent     = r.totalMovs;
  document.getElementById('dash-entradas').textContent = r.totalEntradas;
  document.getElementById('dash-salidas').textContent  = r.totalSalidas;
}

// ═══════════════════════════════════════════════════════
// MÓDULO: BODEGAS
// ═══════════════════════════════════════════════════════
function initBodegas() {
  document.getElementById('btn-guardar-bodega').addEventListener('click', guardarBodega);
  document.getElementById('btn-limpiar-bodega').addEventListener('click', limpiarFormBodega);
  renderBodegas();
}

function guardarBodega() {
  const nombre   = v('b-nombre');
  const codigo   = v('b-codigo').toUpperCase();
  const ubicacion= v('b-ubicacion');
  const desc     = v('b-desc');

  if (!nombre || !codigo) {
    showAlert('Completa los campos obligatorios (*).' , 'error');
    return;
  }

  // Código único
  const yaExiste = getBodegas().some(b => b.codigo === codigo);
  if (yaExiste) {
    showAlert(`El código "${codigo}" ya está en uso. Elige otro.`, 'error');
    return;
  }

  const bodega = {
    id        : Date.now(),
    nombre,
    codigo,
    ubicacion : ubicacion || '—',
    desc      : desc || '',
    creadoEn  : new Date().toISOString(),
  };

  addBodega(bodega);
  limpiarFormBodega();
  renderBodegas();
  actualizarDashboard();
  showAlert(`Bodega "${nombre}" creada correctamente.`, 'success');
}

function limpiarFormBodega() {
  ['b-nombre','b-codigo','b-ubicacion','b-desc'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

function renderBodegas() {
  const cont = document.getElementById('lista-bodegas');
  const lista = getBodegas();

  if (lista.length === 0) {
    cont.innerHTML = '<p class="vacio">No hay bodegas registradas aún.</p>';
    return;
  }

  cont.innerHTML = lista.map(b => {
    const total = getTotalUnidasBodega(b.id);
    const movs  = getMovimientosByBodega(b.id).length;
    const stock = getStockBodega(b.id);
    const productos = Object.entries(stock).filter(([,u]) => u > 0);

    return `
      <div class="bodega-card">
        <div class="bodega-card-top">
          <div>
            <span class="badge-codigo">${b.codigo}</span>
            <strong class="bodega-nombre">${b.nombre}</strong>
            <span class="bodega-ubi">📍 ${b.ubicacion}</span>
          </div>
          <div class="bodega-acciones">
            <button class="btn-icono btn-mover" title="Registrar movimiento"
              onclick="irMovDesde(${b.id})">➕ Movimiento</button>
            <button class="btn-icono btn-danger" title="Eliminar bodega"
              onclick="eliminarBodega(${b.id}, '${b.nombre}', ${total})">🗑</button>
          </div>
        </div>

        <div class="bodega-stats">
          <span>📦 <strong>${total}</strong> unidades en stock</span>
          <span>🔄 <strong>${movs}</strong> movimientos</span>
        </div>

        ${productos.length > 0 ? `
          <div class="bodega-productos">
            ${productos.map(([prod, cant]) => `
              <span class="tag-producto">${prod}: ${cant}</span>
            `).join('')}
          </div>
        ` : '<p class="vacio-sm">Sin productos en stock.</p>'}

        ${b.desc ? `<p class="bodega-desc">${b.desc}</p>` : ''}
      </div>
    `;
  }).join('');
}

function eliminarBodega(id, nombre, total) {
  if (total > 0) {
    showAlert(`No puedes eliminar "${nombre}" porque tiene ${total} unidades en stock.`, 'error');
    return;
  }
  if (!confirm(`¿Eliminar la bodega "${nombre}"? Esta acción no se puede deshacer.`)) return;
  deleteBodega(id);
  renderBodegas();
  actualizarDashboard();
  showAlert(`Bodega "${nombre}" eliminada.`, 'info');
}

// ═══════════════════════════════════════════════════════
// MÓDULO: MOVIMIENTOS
// ═══════════════════════════════════════════════════════
function initMovimientos() {
  document.getElementById('btn-registrar-mov').addEventListener('click', registrarMov);
  document.getElementById('btn-limpiar-mov').addEventListener('click', limpiarFormMov);
  poblarSelectBodegas();
}

function poblarSelectBodegas() {
  const sel = document.getElementById('m-bodega');
  const prev = sel.value;
  const lista = getBodegas();
  sel.innerHTML = '<option value="">— Seleccionar bodega —</option>' +
    lista.map(b => `<option value="${b.id}">${b.nombre} (${b.codigo})</option>`).join('');
  if (prev) sel.value = prev;
}

function irMovDesde(bodegaId) {
  irTab('movimientos');
  setTimeout(() => {
    const sel = document.getElementById('m-bodega');
    sel.value = bodegaId;
  }, 50);
}

function registrarMov() {
  const bodegaId = parseInt(document.getElementById('m-bodega').value);
  const tipoRadio = document.querySelector('input[name="m-tipo"]:checked');
  const tipo     = tipoRadio ? tipoRadio.value : 'entrada';
  const producto = v('m-producto');
  const cantidad = parseInt(document.getElementById('m-cantidad').value);
  const notas    = v('m-notas');

  if (!bodegaId) { showAlert('Selecciona una bodega.', 'error'); return; }
  if (!producto)  { showAlert('Ingresa el nombre del producto.', 'error'); return; }
  if (!cantidad || cantidad <= 0) { showAlert('La cantidad debe ser mayor a 0.', 'error'); return; }

  const resultado = registrarMovimiento({ bodegaId, tipo, producto, cantidad, notas });

  if (!resultado.ok) {
    showAlert(resultado.error, 'error');
    return;
  }

  limpiarFormMov();
  renderBodegas();
  actualizarDashboard();

  const tipoLabel = tipo === 'entrada' ? '📥 Entrada' : '📤 Salida';
  showAlert(`${tipoLabel} registrada: ${cantidad} u. de "${producto}".`, 'success');
}

function limpiarFormMov() {
  document.getElementById('m-bodega').value  = '';
  document.getElementById('m-tipo').value    = 'entrada';
  document.getElementById('m-cantidad').value = '';
  ['m-producto','m-notas'].forEach(id => document.getElementById(id).value = '');
}

// ═══════════════════════════════════════════════════════
// MÓDULO: HISTORIAL
// ═══════════════════════════════════════════════════════
let filtroHistorial = 'todos';

function initHistorial() {
  document.querySelectorAll('.filtro-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      filtroHistorial = btn.dataset.filtro;
      renderHistorial();
    });
  });

  document.getElementById('btn-exportar-csv').addEventListener('click', () => {
    const movs = getMovimientos();
    if (movs.length === 0) { showAlert('No hay movimientos para exportar.', 'info'); return; }
    exportarCSV();
    showAlert('Historial exportado como CSV.', 'success');
  });

  document.getElementById('btn-limpiar-todo').addEventListener('click', () => {
    if (!confirm('¿Eliminar TODOS los datos? Esta acción es irreversible.')) return;
    clearAll();
    renderBodegas();
    renderHistorial();
    actualizarDashboard();
    showAlert('Todos los datos han sido eliminados.', 'info');
  });
}

function renderHistorial() {
  const cont = document.getElementById('lista-historial');
  let movs = getMovimientos();

  if (filtroHistorial !== 'todos') {
    movs = movs.filter(m => m.tipo === filtroHistorial);
  }

  if (movs.length === 0) {
    cont.innerHTML = '<p class="vacio">No hay movimientos registrados.</p>';
    return;
  }

  cont.innerHTML = movs.map(m => `
    <div class="mov-row mov-${m.tipo}">
      <span class="mov-tipo-badge ${m.tipo}">${m.tipo === 'entrada' ? '📥 Entrada' : '📤 Salida'}</span>
      <div class="mov-info">
        <strong>${m.producto}</strong>
        <span class="mov-bodega">📍 ${m.bodegaNombre}</span>
      </div>
      <span class="mov-cantidad ${m.tipo}">
        ${m.tipo === 'entrada' ? '+' : '-'}${m.cantidad} u.
      </span>
      <span class="mov-fecha">${fmtFecha(m.fecha)}</span>
      ${m.notas ? `<span class="mov-nota" title="${m.notas}">💬</span>` : ''}
    </div>
  `).join('');
}

// ─── HELPERS ─────────────────────────────────────────────────
function v(id) {
  return document.getElementById(id).value.trim();
}
