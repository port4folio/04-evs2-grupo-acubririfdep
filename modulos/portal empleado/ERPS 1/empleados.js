// ============================================================
// empleados.js — CRUD de empleados (localStorage)
// ERPS-01 · Seguridad LTDA
// ============================================================

const STORAGE_KEY = 'erps_employees';
let employees     = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let editingId     = null;

// ── VISTAS ──────────────────────────────────────────────────

/**
 * Muestra el listado de empleados y oculta el formulario.
 */
function showList() {
  document.getElementById('form-view').style.display                  = 'none';
  document.getElementById('employee-list-view').classList.add('visible');
  renderList();
}

/**
 * Muestra el formulario de creación o edición.
 * @param {string|null} id  ID del empleado a editar, o null para nuevo.
 */
function showForm(id) {
  editingId = id;

  document.getElementById('employee-list-view').classList.remove('visible');
  document.getElementById('form-view').style.display = 'block';

  const isEdit = Boolean(id);
  document.getElementById('form-title').textContent        = isEdit ? 'Editar ficha de empleado' : 'Nueva ficha de empleado';
  document.getElementById('breadcrumb-current').textContent = isEdit ? 'Editar empleado' : 'Nuevo empleado';

  clearForm();
  resetStepper();

  // Limpiar tabla de cargas
  const tbody = document.getElementById('cargas-tbody');
  tbody.innerHTML = '<tr id="cargas-empty-row"><td colspan="6" class="cargas-empty">Sin cargas familiares registradas</td></tr>';
  cargaCount = 0;

  if (isEdit) {
    const emp = employees.find(e => e.id === id);
    if (emp) {
      fillForm(emp);
      if (emp.cargas?.length) loadCargasData(emp.cargas);
    }
  } else {
    autoGenerateCode();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fechaIngreso').value = today;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── GUARDADO ────────────────────────────────────────────────

/**
 * Guarda el empleado actual (nuevo o edición) en localStorage.
 * Valida el paso actual antes de guardar.
 */
function saveEmployee() {
  if (!validateStep(currentStep)) return;

  const photo   = document.getElementById('photo-preview').src;
  const newEmp  = buildEmployeeObject(photo);

  if (editingId) {
    employees = employees.map(e => e.id === editingId ? newEmp : e);
    showToast('✓ Empleado actualizado correctamente');
  } else {
    employees.push(newEmp);
    showToast('✓ Empleado registrado correctamente');
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  setTimeout(showList, 1200);
}

/**
 * Elimina un empleado del array y del localStorage.
 * Pide confirmación al usuario.
 * @param {string} id
 */
function deleteEmployee(id) {
  if (!confirm('¿Eliminar este empleado del sistema? Esta acción no se puede deshacer.')) return;
  employees = employees.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  showToast('Empleado eliminado', 'warning');
  renderList();
}

// ── RENDERIZADO ─────────────────────────────────────────────

/**
 * Renderiza el listado completo de empleados.
 */
function renderList() {
  const container = document.getElementById('emp-list-container');
  const countEl   = document.getElementById('emp-count');

  countEl.textContent = `${employees.length} empleado${employees.length !== 1 ? 's' : ''}`;

  if (employees.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:48px; color:var(--text3); font-size:14px;">
        <div style="font-size:40px; margin-bottom:12px;">👤</div>
        No hay empleados registrados aún.<br>
        <button class="btn btn-primary" style="margin-top:16px" onclick="showForm(null)">
          Registrar primer empleado
        </button>
      </div>`;
    return;
  }

  container.innerHTML = employees.map(emp => renderEmployeeCard(emp)).join('');
}

/**
 * Genera el HTML de una tarjeta de empleado.
 * @param {Object} emp
 * @returns {string}
 */
function renderEmployeeCard(emp) {
  const fullName    = [emp.nombre1, emp.nombre2, emp.apellidop, emp.apellidom].filter(Boolean).join(' ');
  const initials    = ((emp.nombre1?.[0] || '') + (emp.apellidop?.[0] || '')).toUpperCase();
  const avatarHtml  = emp.photo
    ? `<img src="${emp.photo}" alt="${emp.nombre1}">`
    : initials;
  const sueldo      = emp.sueldoBase
    ? `<span>💰 $${parseInt(emp.sueldoBase).toLocaleString('es-CL')}</span>`
    : '';

  return `
    <div class="emp-card">
      <div class="emp-avatar">${avatarHtml}</div>
      <div class="emp-info">
        <div class="emp-name">${fullName}</div>
        <div class="emp-meta">
          <span>📋 ${emp.codEmpleado}</span>
          <span>💼 ${emp.cargo}</span>
          <span>🏢 ${emp.area}</span>
          ${sueldo}
        </div>
      </div>
      <span class="emp-badge">${emp.tipoContrato || 'Activo'}</span>
      <div class="emp-actions">
        <button class="btn btn-secondary btn-sm" onclick="showForm('${emp.id}')">✏️ Editar</button>
        <button class="btn btn-danger btn-sm"    onclick="deleteEmployee('${emp.id}')">🗑️</button>
      </div>
    </div>`;
}

// ── HELPERS ─────────────────────────────────────────────────

/**
 * Genera automáticamente el código de empleado correlativo.
 */
function autoGenerateCode() {
  const n = employees.length + 1;
  const el = document.getElementById('codEmpleado');
  if (el) el.value = 'EMP-' + String(n).padStart(4, '0');
}

/**
 * Construye el objeto empleado desde los valores del formulario.
 * @param {string} photo  Base64 de la foto o cadena vacía
 * @returns {Object}
 */
function buildEmployeeObject(photo) {
  return {
    id:             editingId || Date.now().toString(),
    photo:          photo.startsWith('data:') ? photo : null,
    // Datos personales
    nombre1:        val('nombre1'),
    nombre2:        val('nombre2'),
    apellidop:      val('apellidop'),
    apellidom:      val('apellidom'),
    rut:            val('rut'),
    fechaNac:       val('fechaNac'),
    genero:         val('genero'),
    nacionalidad:   val('nacionalidad'),
    estadoCivil:    val('estadoCivil'),
    nivelEduc:      val('nivelEduc'),
    telefono:       val('telefono'),
    email:          val('email'),
    direccion:      val('direccion'),
    ciudad:         val('ciudad'),
    region:         val('region'),
    // Datos laborales
    codEmpleado:    val('codEmpleado'),
    cargo:          val('cargo'),
    area:           val('area'),
    centroCosto:    val('centroCosto'),
    sucursal:       val('sucursal'),
    tipoContrato:   val('tipoContrato'),
    fechaIngreso:   val('fechaIngreso'),
    fechaTermino:   val('fechaTermino'),
    jornada:        val('jornada'),
    horario:        val('horario'),
    calidadJuridica:val('calidadJuridica'),
    sueldoBase:     val('sueldoBase'),
    gratificacion:  val('gratificacion'),
    formaPago:      val('formaPago'),
    banco:          val('banco'),
    tipoCuenta:     val('tipoCuenta'),
    numCuenta:      val('numCuenta'),
    // Previsión
    afp:            val('afp'),
    salud:          val('salud'),
    isapre:         val('isapre'),
    cotSalud:       val('cotSalud'),
    segCesantia:    val('segCesantia'),
    mutualidad:     val('mutualidad'),
    tramoFonasa:    val('tramoFonasa'),
    obsProvision:   val('obsProvision'),
    // Cargas
    cargas:         getCargasData(),
    // Metadata
    createdAt:      editingId
                      ? employees.find(e => e.id === editingId)?.createdAt
                      : new Date().toISOString(),
    updatedAt:      new Date().toISOString()
  };
}
