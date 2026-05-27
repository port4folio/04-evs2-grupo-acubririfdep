// ============================================================
// cargas.js — Gestión de cargas familiares
// ERPS-01 · Seguridad LTDA
// ============================================================

let cargaCount = 0;

/**
 * Agrega una nueva fila vacía a la tabla de cargas familiares.
 */
function addCarga() {
  // Quitar la fila vacía si existe
  const emptyRow = document.getElementById('cargas-empty-row');
  if (emptyRow) emptyRow.remove();

  const id = 'carga-' + (++cargaCount);
  const tr = document.createElement('tr');
  tr.id = id;
  tr.innerHTML = `
    <td>
      <input placeholder="Nombre completo" onchange="updateCargaStats()">
    </td>
    <td>
      <input placeholder="12.345.678-9" maxlength="12">
    </td>
    <td>
      <select onchange="updateCargaStats()">
        <option value="">...</option>
        <option>Cónyuge / Conviviente</option>
        <option>Hijo/a</option>
        <option>Hijo/a mayor con discapacidad</option>
        <option>Padre / Madre</option>
        <option>Otro</option>
      </select>
    </td>
    <td>
      <input type="date">
    </td>
    <td>
      <select onchange="updateCargaStats()">
        <option>No</option>
        <option>Sí</option>
      </select>
    </td>
    <td>
      <button class="btn btn-danger btn-icon"
              onclick="removeCarga('${id}')"
              title="Eliminar carga">✕</button>
    </td>`;

  document.getElementById('cargas-tbody').appendChild(tr);
  updateCargaStats();
}

/**
 * Elimina una fila de carga familiar por su id.
 * Si no quedan filas, muestra el mensaje de tabla vacía.
 * @param {string} id  ID de la fila a eliminar
 */
function removeCarga(id) {
  const row = document.getElementById(id);
  if (row) row.remove();

  const tbody = document.getElementById('cargas-tbody');
  if (tbody.children.length === 0) {
    const tr = document.createElement('tr');
    tr.id = 'cargas-empty-row';
    tr.innerHTML = '<td colspan="6" class="cargas-empty">Sin cargas familiares registradas</td>';
    tbody.appendChild(tr);
  }
  updateCargaStats();
}

/**
 * Recalcula los contadores del resumen de cargas:
 * total, hijos y personas con discapacidad.
 */
function updateCargaStats() {
  const rows = [...document.querySelectorAll('#cargas-tbody tr')]
    .filter(r => r.id !== 'cargas-empty-row');

  let hijos = 0;
  let disc  = 0;

  rows.forEach(r => {
    const selects = r.querySelectorAll('select');
    const parentesco   = selects[0]?.value || '';
    const discapacidad = selects[1]?.value || '';

    if (parentesco.startsWith('Hijo') || parentesco.includes('discapacidad')) hijos++;
    if (discapacidad === 'Sí') disc++;
  });

  document.getElementById('count-cargas').textContent = rows.length;
  document.getElementById('count-hijos').textContent  = hijos;
  document.getElementById('count-disc').textContent   = disc;
}

/**
 * Serializa todas las cargas de la tabla en un array de objetos.
 * @returns {Array<Object>}
 */
function getCargasData() {
  return [...document.querySelectorAll('#cargas-tbody tr')]
    .filter(r => r.id !== 'cargas-empty-row')
    .map(r => {
      const inputs  = r.querySelectorAll('input');
      const selects = r.querySelectorAll('select');
      return {
        nombre:       inputs[0]?.value  || '',
        rut:          inputs[1]?.value  || '',
        parentesco:   selects[0]?.value || '',
        fechaNac:     inputs[2]?.value  || '',
        discapacidad: selects[1]?.value || 'No'
      };
    });
}

/**
 * Carga datos de cargas familiares en la tabla (para edición).
 * @param {Array<Object>} cargas  Array de cargas guardadas
 */
function loadCargasData(cargas) {
  if (!cargas || cargas.length === 0) return;

  // Limpiar tabla primero
  cargaCount = 0;
  const tbody = document.getElementById('cargas-tbody');
  tbody.innerHTML = '';

  cargas.forEach(carga => {
    const id = 'carga-' + (++cargaCount);
    const tr = document.createElement('tr');
    tr.id = id;
    tr.innerHTML = `
      <td><input placeholder="Nombre completo" value="${carga.nombre || ''}" onchange="updateCargaStats()"></td>
      <td><input placeholder="12.345.678-9" maxlength="12" value="${carga.rut || ''}"></td>
      <td>
        <select onchange="updateCargaStats()">
          <option value="">...</option>
          <option ${carga.parentesco === 'Cónyuge / Conviviente' ? 'selected' : ''}>Cónyuge / Conviviente</option>
          <option ${carga.parentesco === 'Hijo/a' ? 'selected' : ''}>Hijo/a</option>
          <option ${carga.parentesco === 'Hijo/a mayor con discapacidad' ? 'selected' : ''}>Hijo/a mayor con discapacidad</option>
          <option ${carga.parentesco === 'Padre / Madre' ? 'selected' : ''}>Padre / Madre</option>
          <option ${carga.parentesco === 'Otro' ? 'selected' : ''}>Otro</option>
        </select>
      </td>
      <td><input type="date" value="${carga.fechaNac || ''}"></td>
      <td>
        <select onchange="updateCargaStats()">
          <option ${carga.discapacidad === 'No' ? 'selected' : ''}>No</option>
          <option ${carga.discapacidad === 'Sí' ? 'selected' : ''}>Sí</option>
        </select>
      </td>
      <td>
        <button class="btn btn-danger btn-icon"
                onclick="removeCarga('${id}')"
                title="Eliminar carga">✕</button>
      </td>`;
    tbody.appendChild(tr);
  });
  updateCargaStats();
}
