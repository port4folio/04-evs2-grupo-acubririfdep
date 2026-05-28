// ============================================================
// utils.js — Funciones de utilidad: validaciones, formato, UI
// ERPS-01 · Seguridad LTDA
// ============================================================

/**
 * Retorna el valor de un campo por su id.
 * @param {string} id
 * @returns {string}
 */
function val(id) {
  return document.getElementById(id)?.value?.trim() || '';
}

/**
 * Formatea y valida el RUT chileno en tiempo real.
 * Formato esperado: XX.XXX.XXX-D
 * @param {HTMLInputElement} el
 */
function formatRut(el) {
  let raw = el.value.replace(/[^0-9kK]/g, '');
  if (raw.length > 1) {
    const dv  = raw.slice(-1);
    let   num = raw.slice(0, -1);
    num = num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    raw = num + '-' + dv;
  }
  el.value = raw;

  const isValid = validateRutDigit(raw);
  el.classList.toggle('error', raw.length > 3 && !isValid);
  el.classList.toggle('valid', isValid);

  const errEl = document.getElementById('err-rut');
  if (errEl) errEl.classList.toggle('show', raw.length > 3 && !isValid);
}

/**
 * Valida el dígito verificador de un RUT chileno.
 * @param {string} rut  Con puntos y guión (ej: 12.345.678-9)
 * @returns {boolean}
 */
function validateRutDigit(rut) {
  if (!rut || rut.length < 3) return false;
  const clean = rut.replace(/\./g, '').replace(/-/g, '');
  if (clean.length < 2) return false;

  const dv  = clean.slice(-1).toUpperCase();
  const num = parseInt(clean.slice(0, -1));
  if (isNaN(num)) return false;

  let suma = 0, mul = 2, n = num;
  while (n > 0) {
    suma += (n % 10) * mul;
    n     = Math.floor(n / 10);
    mul   = mul === 7 ? 2 : mul + 1;
  }
  const calc     = 11 - (suma % 11);
  const expected = calc === 11 ? '0' : calc === 10 ? 'K' : String(calc);
  return dv === expected;
}

/**
 * Valida que un campo no esté vacío.
 * Agrega/quita clases error y valid.
 * @param {HTMLElement} el
 */
function validateField(el) {
  const filled = el.value.trim() !== '';
  el.classList.toggle('error', !filled);
  el.classList.toggle('valid', filled);
  const errEl = document.getElementById('err-' + el.id);
  if (errEl) errEl.classList.toggle('show', !filled);
}

/**
 * Valida formato de correo electrónico.
 * @param {HTMLInputElement} el
 */
function validateEmail(el) {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value);
  el.classList.toggle('error', el.value.length > 0 && !isValid);
  el.classList.toggle('valid', isValid && el.value.length > 0);
  const errEl = document.getElementById('err-email');
  if (errEl) errEl.classList.toggle('show', el.value.length > 0 && !isValid);
}

/**
 * Preview de la foto del empleado.
 * @param {HTMLInputElement} input
 */
function previewPhoto(input) {
  if (!input.files || !input.files[0]) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    document.getElementById('photo-preview').src         = e.target.result;
    document.getElementById('photo-preview').style.display = 'block';
    document.getElementById('photo-text').style.display    = 'none';
  };
  reader.readAsDataURL(input.files[0]);
}

/**
 * Muestra/oculta el selector de ISAPRE según el sistema de salud elegido.
 * @param {HTMLSelectElement} sel
 */
function updateIsapre(sel) {
  const isapre = document.getElementById('isapre-group');
  if (isapre) isapre.style.display = sel.value === 'ISAPRE' ? 'block' : 'none';
  validateField(sel);
}

/**
 * Muestra un toast de notificación.
 * @param {string}  msg
 * @param {'success'|'error'|'warning'} type
 */
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'toast show' + (type !== 'success' ? ' ' + type : '');
  setTimeout(() => t.classList.remove('show'), 3000);
}

/**
 * Limpia todos los campos del formulario y resetea estilos.
 */
function clearForm() {
  const textFields = [
    'nombre1','nombre2','apellidop','apellidom','rut','telefono','email',
    'direccion','ciudad','codEmpleado','cargo','centroCosto','sucursal',
    'horario','sueldoBase','numCuenta','obsProvision'
  ];
  const selectFields = [
    'fechaNac','genero','nacionalidad','estadoCivil','nivelEduc','region',
    'area','tipoContrato','fechaIngreso','fechaTermino','jornada','calidadJuridica',
    'gratificacion','formaPago','banco','tipoCuenta',
    'afp','salud','isapre','cotSalud','segCesantia','mutualidad','tramoFonasa'
  ];

  [...textFields, ...selectFields].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('error', 'valid'); }
  });

  // Reset photo
  const preview = document.getElementById('photo-preview');
  const text    = document.getElementById('photo-text');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  if (text)    text.style.display = 'block';

  // Reset ISAPRE group
  const isapreGroup = document.getElementById('isapre-group');
  if (isapreGroup) isapreGroup.style.display = 'none';

  // Clear field errors
  document.querySelectorAll('.field-error').forEach(e => e.classList.remove('show'));
}

/**
 * Rellena el formulario con los datos de un empleado existente.
 * @param {Object} emp  Objeto empleado del array employees
 */
function fillForm(emp) {
  const allFields = [
    'nombre1','nombre2','apellidop','apellidom','rut','fechaNac','genero','nacionalidad',
    'estadoCivil','nivelEduc','telefono','email','direccion','ciudad','region',
    'codEmpleado','cargo','area','centroCosto','sucursal','tipoContrato','fechaIngreso',
    'fechaTermino','jornada','horario','calidadJuridica','sueldoBase','gratificacion',
    'formaPago','banco','tipoCuenta','numCuenta','afp','salud','isapre','cotSalud',
    'segCesantia','mutualidad','tramoFonasa','obsProvision'
  ];
  allFields.forEach(f => {
    const el = document.getElementById(f);
    if (el && emp[f]) { el.value = emp[f]; el.classList.add('valid'); }
  });

  if (emp.salud === 'ISAPRE') {
    const ig = document.getElementById('isapre-group');
    if (ig) ig.style.display = 'block';
  }
  if (emp.photo) {
    document.getElementById('photo-preview').src         = emp.photo;
    document.getElementById('photo-preview').style.display = 'block';
    document.getElementById('photo-text').style.display    = 'none';
  }
}
