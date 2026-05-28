/**
 * app.js
 * Lógica principal de la interfaz de usuario
 */

// ─────────────────────────────────────────
// ESTADO LOCAL DEL MODAL
// ─────────────────────────────────────────
let modalDocId = null;

// ─────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initEmpleados();
  initGenerar();
  initDocumentos();
  initModal();
  actualizarStats();
});

// ─────────────────────────────────────────
// TABS
// ─────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + tabId).classList.add('active');

      if (tabId === 'generar') populateSelects();
      if (tabId === 'documentos') renderDocumentos();
    });
  });
}

function irATab(nombre) {
  document.querySelector(`.tab[data-tab="${nombre}"]`).click();
}

// ─────────────────────────────────────────
// ALERTAS
// ─────────────────────────────────────────
let alertTimeout;
function showAlert(msg, tipo = 'success') {
  const el = document.getElementById('alert-box');
  el.textContent = msg;
  el.className = `alert ${tipo}`;
  el.classList.remove('hidden');
  clearTimeout(alertTimeout);
  alertTimeout = setTimeout(() => el.classList.add('hidden'), 3500);
}

// ─────────────────────────────────────────
// MÓDULO: EMPLEADOS
// ─────────────────────────────────────────
function initEmpleados() {
  document.getElementById('btn-guardar-emp').addEventListener('click', guardarEmpleado);
  document.getElementById('btn-limpiar-emp').addEventListener('click', limpiarFormEmpleado);
  renderEmpleados();
}

function guardarEmpleado() {
  const nombre  = document.getElementById('e-nombre').value.trim();
  const rut     = document.getElementById('e-rut').value.trim();
  const cargo   = document.getElementById('e-cargo').value.trim();
  const sueldo  = document.getElementById('e-sueldo').value.trim();
  const inicio  = document.getElementById('e-inicio').value;

  if (!nombre || !rut || !cargo || !sueldo || !inicio) {
    showAlert('Completa los campos obligatorios marcados con *.', 'danger');
    return;
  }

  const empleado = {
    id         : Date.now(),
    nombre,
    rut,
    cargo,
    departamento: document.getElementById('e-depto').value.trim(),
    sueldo     : Number(sueldo),
    inicio,
    tipoContrato: document.getElementById('e-tipo').value,
    email      : document.getElementById('e-email').value.trim(),
    telefono   : document.getElementById('e-tel').value.trim(),
    direccion  : document.getElementById('e-direccion').value.trim(),
  };

  Storage.addEmpleado(empleado);
  renderEmpleados();
  actualizarStats();
  limpiarFormEmpleado();
  showAlert(`Empleado "${nombre}" registrado exitosamente.`);
}

function limpiarFormEmpleado() {
  ['e-nombre','e-rut','e-cargo','e-depto','e-sueldo',
   'e-inicio','e-email','e-tel','e-direccion'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('e-tipo').value = 'indefinido';
}

function editarEmpleado(id) {
  const e = Storage.getEmpleadoById(id);
  if (!e) return;

  document.getElementById('e-nombre').value    = e.nombre;
  document.getElementById('e-rut').value       = e.rut;
  document.getElementById('e-cargo').value     = e.cargo;
  document.getElementById('e-depto').value     = e.departamento || '';
  document.getElementById('e-sueldo').value    = e.sueldo;
  document.getElementById('e-inicio').value    = e.inicio;
  document.getElementById('e-tipo').value      = e.tipoContrato;
  document.getElementById('e-email').value     = e.email || '';
  document.getElementById('e-tel').value       = e.telefono || '';
  document.getElementById('e-direccion').value = e.direccion || '';

  Storage.deleteEmpleado(id);
  renderEmpleados();
  actualizarStats();
  irATab('empleados');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showAlert('Puedes editar los datos del empleado y volver a guardar.', 'info');
}

function eliminarEmpleado(id) {
  const e = Storage.getEmpleadoById(id);
  if (!e) return;
  if (!confirm(`¿Eliminar al empleado "${e.nombre}"? Esta acción no se puede deshacer.`)) return;
  Storage.deleteEmpleado(id);
  renderEmpleados();
  actualizarStats();
  showAlert(`Empleado "${e.nombre}" eliminado.`, 'info');
}

function renderEmpleados() {
  const lista = Storage.getEmpleados();
  const el    = document.getElementById('lista-empleados');

  if (!lista.length) {
    el.innerHTML = '<p class="empty-msg">No hay empleados registrados aún.</p>';
    return;
  }

  el.innerHTML = `<div class="emp-list">
    ${lista.map(e => `
      <div class="emp-item">
        <div class="emp-info">
          <span class="emp-name">${e.nombre}</span>
          <span class="emp-meta">
            ${e.cargo}
            ${e.departamento ? ' · ' + e.departamento : ''}
            · RUT ${e.rut}
            · $${Number(e.sueldo).toLocaleString('es-CL')} brutos
          </span>
        </div>
        <div class="emp-actions">
          <button class="btn btn-sm btn-success" onclick="editarEmpleado(${e.id})" title="Editar">✏️ Editar</button>
          <button class="btn btn-sm btn-danger"  onclick="eliminarEmpleado(${e.id})" title="Eliminar">🗑 Eliminar</button>
        </div>
      </div>
    `).join('')}
  </div>`;
}

// ─────────────────────────────────────────
// MÓDULO: GENERAR DOCUMENTOS
// ─────────────────────────────────────────
function initGenerar() {
  document.getElementById('g-tipo').addEventListener('change', toggleFiniquitoBlock);
  document.getElementById('g-modalidad').addEventListener('change', toggleModalidadBlock);
  document.getElementById('btn-generar').addEventListener('click', generarDocumento);
  document.getElementById('btn-ver-docs').addEventListener('click', () => irATab('documentos'));
}

function toggleFiniquitoBlock() {
  const esFiniquito = document.getElementById('g-tipo').value === 'finiquito';
  document.getElementById('bloque-finiquito').classList.toggle('hidden', !esFiniquito);
}

function toggleModalidadBlock() {
  const esGrupal = document.getElementById('g-modalidad').value === 'grupal';
  document.getElementById('bloque-individual').classList.toggle('hidden', esGrupal);
  document.getElementById('bloque-grupal').classList.toggle('hidden', !esGrupal);
}

function populateSelects() {
  const empleados = Storage.getEmpleados();

  // Select individual
  const sel = document.getElementById('g-empleado');
  sel.innerHTML = '<option value="">— Seleccionar empleado —</option>' +
    empleados.map(e =>
      `<option value="${e.id}">${e.nombre} – ${e.cargo}</option>`
    ).join('');

  // Checkboxes grupales
  const chk = document.getElementById('check-empleados');
  if (!empleados.length) {
    chk.innerHTML = '<p class="empty-msg">Registra empleados primero.</p>';
    return;
  }
  chk.innerHTML = `<div class="check-list">
    ${empleados.map(e => `
      <label class="check-item">
        <input type="checkbox" value="${e.id}" />
        <span class="check-item-name">${e.nombre}</span>
        <span class="check-item-meta">${e.cargo}</span>
      </label>
    `).join('')}
  </div>`;
}

function generarDocumento() {
  const tipo       = document.getElementById('g-tipo').value;
  const modalidad  = document.getElementById('g-modalidad').value;
  const empresa    = document.getElementById('g-empresa').value.trim();
  const rutEmp     = document.getElementById('g-rut-emp').value.trim();
  const rep        = document.getElementById('g-rep').value.trim();
  const dir        = document.getElementById('g-dir').value.trim();

  if (!empresa || !rutEmp) {
    showAlert('Completa los datos del empleador (razón social y RUT).', 'danger');
    return;
  }

  const empleador = { empresa, rutEmp, rep, direccion: dir };

  // Obtener empleados seleccionados
  let empleados = [];
  if (modalidad === 'individual') {
    const id = Number(document.getElementById('g-empleado').value);
    if (!id) { showAlert('Selecciona un empleado.', 'danger'); return; }
    const e = Storage.getEmpleadoById(id);
    if (e) empleados.push(e);
  } else {
    const checks = document.querySelectorAll('#check-empleados input[type="checkbox"]:checked');
    if (!checks.length) { showAlert('Selecciona al menos un empleado.', 'danger'); return; }
    checks.forEach(c => {
      const e = Storage.getEmpleadoById(Number(c.value));
      if (e) empleados.push(e);
    });
  }

  if (!empleados.length) { showAlert('No se encontraron empleados válidos.', 'danger'); return; }

  // Datos del finiquito (si aplica)
  let finData = null;
  if (tipo === 'finiquito') {
    const fechaTerm = document.getElementById('f-fecha').value;
    if (!fechaTerm) { showAlert('Indica la fecha de término del contrato.', 'danger'); return; }
    const causalSel = document.getElementById('f-causal');
    finData = {
      fecha        : fechaTerm,
      causal       : causalSel.value,
      causalTexto  : causalSel.selectedOptions[0].text,
      indemnizacion: Number(document.getElementById('f-indemnizacion').value) || 0,
      vacaciones   : Number(document.getElementById('f-vacaciones').value) || 0,
      otros        : Number(document.getElementById('f-otros').value) || 0,
      observaciones: document.getElementById('f-obs').value.trim(),
    };
  }

  // Generar y guardar cada documento
  let generados = 0;
  empleados.forEach(emp => {
    const contenido = tipo === 'contrato'
      ? Documentos.generarContrato(emp, empleador)
      : Documentos.generarFiniquito(emp, empleador, finData);

    const doc = {
      id       : Date.now() + Math.random(),
      tipo,
      fecha    : new Date().toLocaleDateString('es-CL'),
      empleado : emp,
      empleador,
      finData,
      contenido,
    };

    Storage.addDocumento(doc);
    generados++;
  });

  actualizarStats();
  showAlert(`${generados} documento(s) generado(s) exitosamente. ✅`);
  irATab('documentos');
}

// ─────────────────────────────────────────
// MÓDULO: DOCUMENTOS
// ─────────────────────────────────────────
function initDocumentos() {
  document.getElementById('btn-limpiar-docs').addEventListener('click', () => {
    if (!confirm('¿Eliminar TODOS los documentos? Esta acción no se puede deshacer.')) return;
    Storage.clearDocumentos();
    renderDocumentos();
    actualizarStats();
    showAlert('Todos los documentos fueron eliminados.', 'info');
  });
}

function verDocumento(id) {
  const doc = Storage.getDocumentoById(id);
  if (!doc) return;
  modalDocId = id;
  const tipoLabel = doc.tipo === 'contrato' ? 'Contrato' : 'Finiquito';
  document.getElementById('modal-title').textContent =
    `${tipoLabel} – ${doc.empleado.nombre}`;
  document.getElementById('modal-content').textContent = doc.contenido;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

function descargarDocumento(id) {
  const doc = Storage.getDocumentoById(id);
  if (!doc) return;
  const nombre = Documentos.nombreArchivo(doc.tipo, doc.empleado.nombre);
  Documentos.descargar(doc.contenido, nombre);
}

function eliminarDocumento(id) {
  if (!confirm('¿Eliminar este documento?')) return;
  Storage.deleteDocumento(id);
  renderDocumentos();
  actualizarStats();
  showAlert('Documento eliminado.', 'info');
}

function renderDocumentos() {
  const docs = Storage.getDocumentos();
  const el   = document.getElementById('lista-docs');

  if (!docs.length) {
    el.innerHTML = '<p class="empty-msg">No hay documentos generados aún.</p>';
    return;
  }

  // Mostrar más recientes primero
  const ordenados = [...docs].reverse();

  el.innerHTML = `<div class="doc-list">
    ${ordenados.map(d => `
      <div class="doc-item">
        <div class="doc-header">
          <div class="doc-title-group">
            <span class="badge badge-${d.tipo}">${d.tipo === 'contrato' ? 'Contrato' : 'Finiquito'}</span>
            <span class="doc-name">${d.empleado.nombre}</span>
          </div>
          <div class="doc-actions">
            <button class="btn btn-sm" onclick="verDocumento('${d.id}')">👁 Ver</button>
            <button class="btn btn-sm btn-success" onclick="descargarDocumento('${d.id}')">⬇️ .txt</button>
            <button class="btn btn-sm btn-danger" onclick="eliminarDocumento('${d.id}')">🗑</button>
          </div>
        </div>
        <div class="doc-meta">
          ${d.empleado.cargo} · ${d.empleador.empresa} · Generado: ${d.fecha}
        </div>
      </div>
    `).join('')}
  </div>`;
}

// ─────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────
function initModal() {
  document.getElementById('btn-modal-close').addEventListener('click', cerrarModal);
  document.getElementById('btn-modal-close2').addEventListener('click', cerrarModal);
  document.getElementById('btn-modal-download').addEventListener('click', () => {
    if (modalDocId) descargarDocumento(modalDocId);
  });
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-overlay')) cerrarModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') cerrarModal();
  });
}

function cerrarModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  modalDocId = null;
}

// ─────────────────────────────────────────
// STATS
// ─────────────────────────────────────────
function actualizarStats() {
  const empleados  = Storage.getEmpleados();
  const docs       = Storage.getDocumentos();
  const contratos  = docs.filter(d => d.tipo === 'contrato').length;
  const finiquitos = docs.filter(d => d.tipo === 'finiquito').length;

  document.getElementById('st-empleados').textContent  = empleados.length;
  document.getElementById('st-contratos').textContent  = contratos;
  document.getElementById('st-finiquitos').textContent = finiquitos;
  document.getElementById('st-total-docs').textContent = docs.length;
}
