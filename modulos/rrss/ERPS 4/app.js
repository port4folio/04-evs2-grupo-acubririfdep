/**
 * app.js
 * Controlador principal de la interfaz — Sistema de Licencias Médicas
 */

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initEmpleados();
  initLicencias();
  initRemuneraciones();
  initEstadisticas();
  actualizarKPIs();
});

// ════════════════════════════════════════════
// TABS
// ════════════════════════════════════════════
function initTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + tabId).classList.add('active');

      if (tabId === 'licencias')      populateSelectEmpleados();
      if (tabId === 'estadisticas')   renderEstadisticas();
      if (tabId === 'remuneraciones') setDefaultPeriodo();
    });
  });
}

function irATab(nombre) {
  document.querySelector(`.tab[data-tab="${nombre}"]`).click();
}

// ════════════════════════════════════════════
// ALERTAS
// ════════════════════════════════════════════
let _alertTimer;
function showAlert(msg, tipo = 'success') {
  const el = document.getElementById('alert-box');
  el.textContent = msg;
  el.className = `alert ${tipo}`;
  el.classList.remove('hidden');
  clearTimeout(_alertTimer);
  _alertTimer = setTimeout(() => el.classList.add('hidden'), 3800);
}

// ════════════════════════════════════════════
// KPIs GLOBALES
// ════════════════════════════════════════════
function actualizarKPIs() {
  const empleados = Storage.getEmpleados();
  const licencias  = Storage.getLicencias();

  document.getElementById('kpi-empleados').textContent = empleados.length;
  document.getElementById('kpi-licencias').textContent  = licencias.length;

  const totalDias = licencias.reduce((s, l) =>
    s + Calculos.calcularDias(l.inicio, l.termino), 0);
  document.getElementById('kpi-dias').textContent = totalDias;

  const subsidio = Calculos.subsidioTotalAcumulado(licencias, empleados);
  document.getElementById('kpi-subsidio').textContent =
    '$' + subsidio.toLocaleString('es-CL');
}

// ════════════════════════════════════════════
// MÓDULO: EMPLEADOS
// ════════════════════════════════════════════
function initEmpleados() {
  document.getElementById('btn-guardar-emp').addEventListener('click', guardarEmpleado);
  document.getElementById('btn-limpiar-emp').addEventListener('click', limpiarFormEmp);
  renderEmpleados();
}

function guardarEmpleado() {
  const nombre  = v('e-nombre');
  const rut     = v('e-rut');
  const cargo   = v('e-cargo');
  const sueldo  = v('e-sueldo');

  if (!nombre || !rut || !cargo || !sueldo) {
    showAlert('Completa los campos obligatorios (*).', 'danger');
    return;
  }

  const empleado = {
    id          : Date.now(),
    nombre,
    rut,
    cargo,
    departamento: v('e-depto'),
    sueldo      : Number(sueldo),
    email       : v('e-email'),
    prevision   : sv('e-prevision'),
  };

  Storage.addEmpleado(empleado);
  renderEmpleados();
  actualizarKPIs();
  limpiarFormEmp();
  showAlert(`Empleado "${nombre}" registrado correctamente.`);
}

function limpiarFormEmp() {
  ['e-nombre','e-rut','e-cargo','e-depto','e-sueldo','e-email'].forEach(id => {
    document.getElementById(id).value = '';
  });
}

function renderEmpleados() {
  const lista = Storage.getEmpleados();
  const cont  = document.getElementById('lista-empleados');

  if (lista.length === 0) {
    cont.innerHTML = '<p class="empty-msg">No hay empleados registrados aún.</p>';
    return;
  }

  cont.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nombre</th><th>RUT</th><th>Cargo</th>
            <th>Departamento</th><th class="num-right">Sueldo base</th>
            <th>Previsión</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${lista.map(e => `
            <tr>
              <td><strong>${e.nombre}</strong></td>
              <td>${e.rut}</td>
              <td>${e.cargo}</td>
              <td>${e.departamento || '—'}</td>
              <td class="num-right monto">$${Number(e.sueldo).toLocaleString('es-CL')}</td>
              <td>${e.prevision ? e.prevision.toUpperCase() : '—'}</td>
              <td>
                <button class="btn btn-danger btn-sm" onclick="eliminarEmpleado(${e.id})">Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function eliminarEmpleado(id) {
  if (!confirm('¿Eliminar este empleado y todas sus licencias?')) return;
  Storage.deleteEmpleado(id);
  renderEmpleados();
  actualizarKPIs();
  showAlert('Empleado eliminado.', 'info');
}

// ════════════════════════════════════════════
// MÓDULO: LICENCIAS
// ════════════════════════════════════════════
function initLicencias() {
  document.getElementById('btn-guardar-lic').addEventListener('click', guardarLicencia);
  document.getElementById('btn-limpiar-lic').addEventListener('click', limpiarFormLic);

  // Preview de días
  ['l-inicio', 'l-termino'].forEach(id => {
    document.getElementById(id).addEventListener('change', actualizarPreviewDias);
  });

  // Filtros
  document.getElementById('filtro-tipo-lic').addEventListener('change', renderLicencias);
  document.getElementById('filtro-estado-lic').addEventListener('change', renderLicencias);

  populateSelectEmpleados();
  renderLicencias();
}

function populateSelectEmpleados() {
  const empleados = Storage.getEmpleados();
  const sel = document.getElementById('l-empleado');
  sel.innerHTML = '<option value="">— Seleccionar empleado —</option>';
  empleados.forEach(e => {
    sel.innerHTML += `<option value="${e.id}">${e.nombre} (${e.rut})</option>`;
  });
}

function actualizarPreviewDias() {
  const ini  = document.getElementById('l-inicio').value;
  const term = document.getElementById('l-termino').value;
  const badge = document.getElementById('dias-preview');
  if (ini && term) {
    const dias = Calculos.calcularDias(ini, term);
    badge.textContent = dias > 0 ? `${dias} día${dias !== 1 ? 's' : ''}` : '— días';
  } else {
    badge.textContent = '— días';
  }
}

function guardarLicencia() {
  const empleadoId = document.getElementById('l-empleado').value;
  const tipo       = sv('l-tipo');
  const inicio     = v('l-inicio');
  const termino    = v('l-termino');

  if (!empleadoId || !tipo || !inicio || !termino) {
    showAlert('Completa todos los campos obligatorios (*).', 'danger');
    return;
  }

  if (new Date(termino) < new Date(inicio)) {
    showAlert('La fecha de término no puede ser anterior al inicio.', 'danger');
    return;
  }

  const dias = Calculos.calcularDias(inicio, termino);

  const licencia = {
    id          : Date.now(),
    empleadoId  : Number(empleadoId),
    tipo,
    inicio,
    termino,
    dias,
    subsidio    : sv('l-subsidio'),
    estado      : sv('l-estado'),
    folio       : v('l-folio'),
    diagnostico : v('l-diagnostico'),
    observaciones: v('l-obs'),
    creadoEn    : new Date().toISOString(),
  };

  Storage.addLicencia(licencia);
  renderLicencias();
  actualizarKPIs();
  limpiarFormLic();
  showAlert(`Licencia registrada: ${dias} día(s) a partir del ${formatFecha(inicio)}.`);
}

function limpiarFormLic() {
  ['l-inicio','l-termino','l-folio','l-diagnostico','l-obs'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('l-empleado').value = '';
  document.getElementById('dias-preview').textContent = '— días';
}

function renderLicencias() {
  let licencias = Storage.getLicencias();
  const empleados = Storage.getEmpleados();

  // Filtros
  const filtroTipo   = document.getElementById('filtro-tipo-lic')?.value   || '';
  const filtroEstado = document.getElementById('filtro-estado-lic')?.value || '';

  if (filtroTipo)   licencias = licencias.filter(l => l.tipo   === filtroTipo);
  if (filtroEstado) licencias = licencias.filter(l => l.estado === filtroEstado);

  const cont = document.getElementById('lista-licencias');

  if (licencias.length === 0) {
    cont.innerHTML = '<p class="empty-msg">No hay licencias que coincidan con los filtros.</p>';
    return;
  }

  // Ordenar por inicio desc
  licencias = [...licencias].sort((a, b) => b.inicio.localeCompare(a.inicio));

  cont.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Empleado</th><th>Tipo</th><th>Inicio</th>
            <th>Término</th><th>Días</th><th>Subsidio</th>
            <th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${licencias.map(l => {
            const emp = empleados.find(e => e.id === l.empleadoId);
            return `
              <tr>
                <td><strong>${emp ? emp.nombre : 'Desconocido'}</strong></td>
                <td><span class="badge badge-${l.tipo}">${Calculos.TIPO_LABEL[l.tipo] || l.tipo}</span></td>
                <td>${formatFecha(l.inicio)}</td>
                <td>${formatFecha(l.termino)}</td>
                <td><strong>${l.dias}</strong></td>
                <td>${l.subsidio}%</td>
                <td><span class="badge badge-${l.estado}">${l.estado.charAt(0).toUpperCase() + l.estado.slice(1)}</span></td>
                <td>
                  <button class="btn btn-danger btn-sm" onclick="eliminarLicencia(${l.id})">Eliminar</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function eliminarLicencia(id) {
  if (!confirm('¿Eliminar esta licencia médica?')) return;
  Storage.deleteLicencia(id);
  renderLicencias();
  actualizarKPIs();
  showAlert('Licencia eliminada.', 'info');
}

// ════════════════════════════════════════════
// MÓDULO: REMUNERACIONES
// ════════════════════════════════════════════
function initRemuneraciones() {
  document.getElementById('btn-calcular').addEventListener('click', calcularRemuneraciones);
  document.getElementById('btn-exportar-rem').addEventListener('click', exportarRemuneraciones);
  setDefaultPeriodo();
}

function setDefaultPeriodo() {
  const hoy = new Date();
  document.getElementById('r-mes').value  = hoy.getMonth() + 1;
  document.getElementById('r-anio').value = hoy.getFullYear();
}

let _resultadosRem = [];
let _mesCal = 0, _anioCal = 0;

function calcularRemuneraciones() {
  const mes  = Number(document.getElementById('r-mes').value);
  const anio = Number(document.getElementById('r-anio').value);
  _mesCal = mes; _anioCal = anio;

  const resultados = Calculos.calcularImpactoMensual(mes, anio);
  _resultadosRem = resultados;

  const panel = document.getElementById('panel-resultado-rem');
  const cont  = document.getElementById('resultado-remuneraciones');
  panel.style.display = 'block';

  if (resultados.length === 0) {
    cont.innerHTML = `
      <p class="empty-msg">
        ✅ No se encontraron licencias activas en <strong>${Calculos.MESES[mes-1]} ${anio}</strong>.<br>
        No hay descuentos por licencia médica este período.
      </p>`;
    return;
  }

  const totalDescuento = resultados.reduce((s, r) => s + r.descuento, 0);
  const totalSubsidio  = resultados.reduce((s, r) => s + r.subsidioTotal, 0);
  const totalNeto      = resultados.reduce((s, r) => s + r.remuneracionTotal, 0);
  const diasMes        = Calculos.diasDelMes(mes, anio);

  cont.innerHTML = `
    <p style="margin-bottom:1rem;color:var(--text-muted);font-size:13px;">
      Período: <strong>${Calculos.MESES[mes-1]} ${anio}</strong> — ${diasMes} días hábiles.
      Se encontraron <strong>${resultados.length}</strong> empleado(s) con licencia en este período.
    </p>
    <div class="table-wrap">
      <table class="rem-table">
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Sueldo base</th>
            <th class="num-right">Días lic.</th>
            <th class="num-right">Días trab.</th>
            <th class="num-right">Sueldo prop.</th>
            <th class="num-right">Subsidio</th>
            <th class="num-right">Rem. neta</th>
            <th class="num-right">Descuento</th>
          </tr>
        </thead>
        <tbody>
          ${resultados.map(r => `
            <tr>
              <td>
                <strong>${r.emp.nombre}</strong><br>
                <span style="font-size:12px;color:var(--text-muted)">${r.emp.cargo}</span>
              </td>
              <td class="monto">$${r.emp.sueldo.toLocaleString('es-CL')}</td>
              <td class="num-right">${r.diasLicTotal}</td>
              <td class="num-right">${r.diasTrabajados}</td>
              <td class="num-right monto">$${r.sueldoProporcional.toLocaleString('es-CL')}</td>
              <td class="num-right" style="color:var(--green);font-weight:600;">$${r.subsidioTotal.toLocaleString('es-CL')}</td>
              <td class="num-right monto">$${r.remuneracionTotal.toLocaleString('es-CL')}</td>
              <td class="num-right descuento">-$${r.descuento.toLocaleString('es-CL')}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5"><strong>Totales del período</strong></td>
            <td class="num-right">$${totalSubsidio.toLocaleString('es-CL')}</td>
            <td class="num-right">$${totalNeto.toLocaleString('es-CL')}</td>
            <td class="num-right">-$${totalDescuento.toLocaleString('es-CL')}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <p class="rem-notice">
      ⚠️ Este cálculo es referencial. El subsidio real lo determina la COMPIN o el empleador según previsión y antigüedad.
      Verifique con su área de liquidaciones antes de emitir.
    </p>
  `;
}

function exportarRemuneraciones() {
  const txt = Calculos.generarResumenTxt(_mesCal, _anioCal, _resultadosRem);
  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `remuneraciones_${Calculos.MESES[_mesCal-1]}_${_anioCal}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// ════════════════════════════════════════════
// MÓDULO: ESTADÍSTICAS
// ════════════════════════════════════════════
function initEstadisticas() {
  // Se renderiza al entrar al tab
}

function renderEstadisticas() {
  const licencias = Storage.getLicencias();
  const empleados = Storage.getEmpleados();

  renderChartTipo(licencias);
  renderRankingEmpleados(licencias, empleados);
  renderIndicadores(licencias, empleados);
  renderChartMeses(licencias);
}

function renderChartTipo(licencias) {
  const cont = document.getElementById('chart-tipo');
  const data = Calculos.estadisticasPorTipo(licencias);
  const tipos = Object.keys(Calculos.TIPO_LABEL);
  const maxCount = Math.max(...tipos.map(t => data[t]?.count || 0), 1);

  if (licencias.length === 0) {
    cont.innerHTML = '<p class="empty-msg">Sin datos aún.</p>';
    return;
  }

  cont.innerHTML = tipos.map(t => {
    const d = data[t] || { count: 0, dias: 0 };
    const pct = Math.round((d.count / maxCount) * 100);
    return `
      <div class="chart-bar-row">
        <div class="chart-bar-label" title="${Calculos.TIPO_LABEL[t]}">${Calculos.TIPO_LABEL[t]}</div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width:${pct}%"></div>
        </div>
        <div class="chart-bar-val">${d.count}</div>
      </div>
    `;
  }).join('');
}

function renderRankingEmpleados(licencias, empleados) {
  const cont    = document.getElementById('chart-empleados');
  const ranking = Calculos.estadisticasPorEmpleado(licencias, empleados).slice(0, 5);

  if (ranking.length === 0) {
    cont.innerHTML = '<p class="empty-msg">Sin datos aún.</p>';
    return;
  }

  cont.innerHTML = ranking.map((r, i) => `
    <div class="emp-rank-row">
      <div class="emp-rank-num">${i + 1}</div>
      <div class="emp-rank-name">${r.nombre} <span style="font-size:12px;color:var(--text-muted)">(${r.dias} días)</span></div>
      <div class="emp-rank-cnt">${r.count} lic.</div>
    </div>
  `).join('');
}

function renderIndicadores(licencias, empleados) {
  const cont = document.getElementById('indicadores-generales');
  const totalDias = licencias.reduce((s, l) => s + Calculos.calcularDias(l.inicio, l.termino), 0);
  const promDias  = licencias.length ? (totalDias / licencias.length).toFixed(1) : 0;
  const subsidio  = Calculos.subsidioTotalAcumulado(licencias, empleados);
  const activas   = licencias.filter(l => l.estado === 'activa').length;

  cont.innerHTML = `
    <div class="indicador-item">
      <div class="indicador-num">${licencias.length}</div>
      <div class="indicador-desc">Total licencias</div>
    </div>
    <div class="indicador-item">
      <div class="indicador-num">${totalDias}</div>
      <div class="indicador-desc">Días acumulados</div>
    </div>
    <div class="indicador-item">
      <div class="indicador-num">${promDias}</div>
      <div class="indicador-desc">Promedio días/licencia</div>
    </div>
    <div class="indicador-item">
      <div class="indicador-num">${activas}</div>
      <div class="indicador-desc">Licencias activas</div>
    </div>
    <div class="indicador-item">
      <div class="indicador-num">${empleados.length}</div>
      <div class="indicador-desc">Empleados registrados</div>
    </div>
    <div class="indicador-item">
      <div class="indicador-num">$${subsidio.toLocaleString('es-CL')}</div>
      <div class="indicador-desc">Subsidio estimado total</div>
    </div>
  `;
}

function renderChartMeses(licencias) {
  const cont  = document.getElementById('chart-meses');
  const datos = Calculos.estadisticasPorMes(licencias);
  const maxV  = Math.max(...datos, 1);
  const mesesCortos = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  cont.innerHTML = `
    <div class="meses-chart">
      ${datos.map((cnt, i) => {
        const h = Math.round((cnt / maxV) * 100);
        return `
          <div class="mes-col">
            <div class="mes-val">${cnt || ''}</div>
            <div class="mes-bar" style="height:${h}%"></div>
            <div class="mes-label">${mesesCortos[i]}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════
function v(id)  { return document.getElementById(id).value.trim(); }
function sv(id) { return document.getElementById(id).value; }

function formatFecha(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}
