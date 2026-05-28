// ============================================================
// stepper.js — Navegación del formulario multi-paso
// ERPS-01 · Seguridad LTDA
// ============================================================

const TOTAL_STEPS = 4;
let currentStep   = 0;

/**
 * Campos requeridos por cada paso del formulario.
 * Se usan en validateStep() antes de avanzar.
 */
const REQUIRED_BY_STEP = [
  // Paso 0 — Datos personales
  ['nombre1', 'apellidop', 'apellidom', 'rut', 'fechaNac', 'genero', 'nacionalidad', 'telefono', 'email'],
  // Paso 1 — Datos laborales
  ['codEmpleado', 'cargo', 'area', 'tipoContrato', 'fechaIngreso', 'jornada', 'sueldoBase'],
  // Paso 2 — Previsión
  ['afp', 'salud'],
  // Paso 3 — Cargas familiares (sin obligatorios)
  []
];

/**
 * Navega directamente a un paso específico.
 * Actualiza el UI del stepper y muestra/oculta secciones.
 * @param {number} step  Índice del paso (0-based)
 */
function goToStep(step) {
  for (let i = 0; i < TOTAL_STEPS; i++) {
    const section   = document.getElementById('step-' + i);
    const stepItem  = document.querySelector(`[data-step="${i}"]`);
    const stepNum   = document.getElementById('sn' + i);

    if (!section || !stepItem || !stepNum) continue;

    // Mostrar/ocultar sección
    section.classList.toggle('visible', i === step);

    // Actualizar estilos del stepper
    stepItem.classList.remove('active', 'done');
    if (i < step) {
      stepItem.classList.add('done');
      stepNum.textContent = '✓';
    } else if (i === step) {
      stepItem.classList.add('active');
      stepNum.textContent = i + 1;
    } else {
      stepNum.textContent = i + 1;
    }
  }

  currentStep = step;
  updateStepButtons();
}

/**
 * Avanza al siguiente paso si el actual es válido.
 */
function nextStep() {
  if (currentStep < TOTAL_STEPS - 1) {
    if (!validateStep(currentStep)) return;
    goToStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/**
 * Retrocede al paso anterior.
 */
function prevStep() {
  if (currentStep > 0) {
    goToStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/**
 * Actualiza la visibilidad de los botones Anterior / Siguiente / Guardar.
 */
function updateStepButtons() {
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnSave = document.getElementById('btn-save');

  if (btnPrev) btnPrev.style.display = currentStep > 0 ? 'block' : 'none';
  if (btnNext) btnNext.style.display = currentStep < TOTAL_STEPS - 1 ? 'block' : 'none';
  if (btnSave) btnSave.style.display = currentStep === TOTAL_STEPS - 1 ? 'block' : 'none';
}

/**
 * Valida los campos requeridos del paso indicado.
 * Marca campos inválidos con clase .error y muestra mensajes.
 * @param {number} step
 * @returns {boolean}  true si todo es válido
 */
function validateStep(step) {
  let isValid = true;

  REQUIRED_BY_STEP[step].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (!el.value.trim()) {
      el.classList.add('error');
      el.classList.remove('valid');
      const errEl = document.getElementById('err-' + id);
      if (errEl) errEl.classList.add('show');
      isValid = false;
    }
  });

  // Validaciones específicas del paso 0
  if (step === 0) {
    const emailEl = document.getElementById('email');
    if (emailEl?.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      emailEl.classList.add('error');
      const errEl = document.getElementById('err-email');
      if (errEl) { errEl.textContent = 'Correo inválido'; errEl.classList.add('show'); }
      isValid = false;
    }
    const rutEl = document.getElementById('rut');
    if (rutEl?.value && !validateRutDigit(rutEl.value)) {
      rutEl.classList.add('error');
      const errEl = document.getElementById('err-rut');
      if (errEl) errEl.classList.add('show');
      isValid = false;
    }
  }

  if (!isValid) showToast('Por favor complete todos los campos requeridos', 'error');
  return isValid;
}

/**
 * Resetea el stepper al paso 0 (para nuevo formulario).
 */
function resetStepper() {
  goToStep(0);
}
