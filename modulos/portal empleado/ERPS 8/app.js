/**
 * app.js
 * Lógica principal de la app de liquidaciones de sueldo
 */

// ── Estado ────────────────────────────────────────
let liquidacionActiva = null;
let filtroPeriodo = 'todos';

// ── Utilidades ────────────────────────────────────
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function fmt(n) {
  return '$' + Number(n || 0).toLocaleString('es-CL');
}

function nombreMes(num) {
  return MESES[(num - 1)] || '';
}

function mostrarAlerta(msg, tipo = 'success') {
  const el = document.getElementById('alerta');
  el.textContent = msg;
  el.className = `alerta alerta--${tipo}`;
  el.classList.remove('oculto');
  setTimeout(() => el.classList.add('oculto'), 3500);
}

// ── Init ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderPerfil();
  renderLista();
  renderResumenAnual();

  document.getElementById('btn-demo').addEventListener('click', () => {
    Storage.clearAll();
    Storage.cargarDemo();
    renderPerfil();
    renderLista();
    renderResumenAnual();
    mostrarAlerta('Datos de demostración cargados exitosamente.');
  });

  document.getElementById('btn-limpiar').addEventListener('click', () => {
    if (!confirm('¿Limpiar todos los datos guardados?')) return;
    Storage.clearAll();
    liquidacionActiva = null;
    renderPerfil();
    renderLista();
    renderResumenAnual();
    ocultarDetalle();
    mostrarAlerta('Datos eliminados.', 'danger');
  });

  document.getElementById('filtro-año').addEventListener('change', e => {
    filtroPeriodo = e.target.value;
    renderLista();
  });

  // Botones del detalle
  document.getElementById('btn-imprimir').addEventListener('click', imprimirLiquidacion);
  document.getElementById('btn-descargar').addEventListener('click', descargarLiquidacion);
  document.getElementById('btn-cerrar').addEventListener('click', ocultarDetalle);
});

// ── Perfil del empleado ───────────────────────────
function renderPerfil() {
  const emp = Storage.getEmpleado();
  const el = document.getElementById('perfil-contenido');

  if (!emp) {
    el.innerHTML = `<p class="vacio">Sin empleado registrado. Carga los datos de demo para comenzar.</p>`;
    return;
  }

  const ingreso = new Date(emp.fechaIngreso + 'T00:00:00');
  const hoy = new Date();
  const años = Math.floor((hoy - ingreso) / (1000 * 60 * 60 * 24 * 365));

  el.innerHTML = `
    <div class="perfil-grid">
      <div class="perfil-avatar">${iniciales(emp.nombre)}</div>
      <div class="perfil-info">
        <h2 class="perfil-nombre">${emp.nombre}</h2>
        <p class="perfil-cargo">${emp.cargo} · ${emp.departamento}</p>
        <p class="perfil-empresa">${emp.empresa} · ${emp.rutEmpresa}</p>
      </div>
      <div class="perfil-datos">
        <div class="dato"><span class="dato-label">RUT</span><span class="dato-val">${emp.rut}</span></div>
        <div class="dato"><span class="dato-label">AFP</span><span class="dato-val">${emp.afp}</span></div>
        <div class="dato"><span class="dato-label">Salud</span><span class="dato-val">${emp.salud}</span></div>
        <div class="dato"><span class="dato-label">Antigüedad</span><span class="dato-val">${años} año${años !== 1 ? 's' : ''}</span></div>
        <div class="dato"><span class="dato-label">Ingreso</span><span class="dato-val">${ingreso.toLocaleDateString('es-CL')}</span></div>
        <div class="dato"><span class="dato-label">Cuenta</span><span class="dato-val">${emp.banco} ${emp.cuentaBancaria}</span></div>
      </div>
    </div>`;
}

function iniciales(nombre) {
  return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

// ── Resumen anual ─────────────────────────────────
function renderResumenAnual() {
  const liqList = Storage.getLiquidaciones();
  const el = document.getElementById('resumen-contenido');

  if (!liqList.length) {
    el.innerHTML = `<p class="vacio">Sin datos.</p>`;
    return;
  }

  const totalAnio = liqList
    .filter(l => l.periodo.año === new Date().getFullYear() || l.periodo.año === new Date().getFullYear() - 1)
    .slice(0, 12);

  const sumaLiquido = totalAnio.reduce((s, l) => s + l.totales.liquidoPagar, 0);
  const sumaImponible = totalAnio.reduce((s, l) => s + l.totales.totalImponible, 0);
  const sumaDesc = totalAnio.reduce((s, l) => s + l.totales.totalDescuentos, 0);
  const promedio = totalAnio.length ? Math.round(sumaLiquido / totalAnio.length) : 0;

  el.innerHTML = `
    <div class="resumen-cards">
      <div class="res-card res-card--blue">
        <span class="res-num">${fmt(sumaLiquido)}</span>
        <span class="res-label">Total líquido recibido</span>
      </div>
      <div class="res-card res-card--green">
        <span class="res-num">${fmt(promedio)}</span>
        <span class="res-label">Promedio mensual</span>
      </div>
      <div class="res-card res-card--orange">
        <span class="res-num">${fmt(sumaImponible)}</span>
        <span class="res-label">Total imponible</span>
      </div>
      <div class="res-card res-card--red">
        <span class="res-num">${fmt(sumaDesc)}</span>
        <span class="res-label">Total descuentos</span>
      </div>
    </div>
    <p class="resumen-nota">Basado en las últimas ${totalAnio.length} liquidaciones.</p>`;
}

// ── Lista de liquidaciones ────────────────────────
function renderLista() {
  const todas = Storage.getLiquidaciones();
  const el = document.getElementById('lista-liquidaciones');
  const selAño = document.getElementById('filtro-año');

  // Actualizar filtro de años
  const años = [...new Set(todas.map(l => l.periodo.año))].sort((a, b) => b - a);
  const valorActual = selAño.value;
  selAño.innerHTML = `<option value="todos">Todos los años</option>` +
    años.map(a => `<option value="${a}" ${String(a) === valorActual ? 'selected' : ''}>${a}</option>`).join('');

  const filtradas = filtroPeriodo === 'todos'
    ? todas
    : todas.filter(l => String(l.periodo.año) === filtroPeriodo);

  if (!filtradas.length) {
    el.innerHTML = `<p class="vacio">${todas.length ? 'Sin resultados para ese período.' : 'No hay liquidaciones. Carga los datos de demo para comenzar.'}</p>`;
    return;
  }

  el.innerHTML = filtradas.map(l => `
    <div class="liq-item ${liquidacionActiva?.id === l.id ? 'liq-item--activo' : ''}" data-id="${l.id}" onclick="abrirDetalle('${l.id}')">
      <div class="liq-icono">📄</div>
      <div class="liq-info">
        <span class="liq-periodo">${nombreMes(l.periodo.mes)} ${l.periodo.año}</span>
        <span class="liq-dias">${l.diasTrabajados} días trabajados</span>
      </div>
      <div class="liq-monto">
        <span class="liq-liquido">${fmt(l.totales.liquidoPagar)}</span>
        <span class="liq-imponible">Imp. ${fmt(l.totales.totalImponible)}</span>
      </div>
      <div class="liq-arrow">›</div>
    </div>`).join('');
}

// ── Detalle de liquidación ────────────────────────
function abrirDetalle(id) {
  const liq = Storage.getLiquidacion(id);
  if (!liq) return;
  liquidacionActiva = liq;
  renderLista(); // actualiza el ítem activo

  const emp = Storage.getEmpleado();
  const panel = document.getElementById('panel-detalle');
  const content = document.getElementById('detalle-contenido');

  const { haberes, descuentos, totales, periodo, fechaPago, diasTrabajados } = liq;

  content.innerHTML = `
    <div class="liq-cabecera">
      <div>
        <h3 class="liq-titulo">Liquidación de Sueldo</h3>
        <p class="liq-subtitulo">${nombreMes(periodo.mes)} ${periodo.año}</p>
      </div>
      <div class="liq-meta">
        <span>Fecha pago: ${new Date(fechaPago + 'T00:00:00').toLocaleDateString('es-CL')}</span>
        <span>Días trabajados: ${diasTrabajados}</span>
      </div>
    </div>

    ${emp ? `
    <div class="liq-seccion">
      <h4 class="sec-titulo">Datos del Trabajador</h4>
      <div class="liq-tabla-info">
        <div class="ti-fila"><span>Nombre</span><span>${emp.nombre}</span></div>
        <div class="ti-fila"><span>RUT</span><span>${emp.rut}</span></div>
        <div class="ti-fila"><span>Cargo</span><span>${emp.cargo}</span></div>
        <div class="ti-fila"><span>Empresa</span><span>${emp.empresa}</span></div>
        <div class="ti-fila"><span>AFP</span><span>${emp.afp}</span></div>
        <div class="ti-fila"><span>Salud</span><span>${emp.salud}</span></div>
      </div>
    </div>` : ''}

    <div class="liq-seccion">
      <h4 class="sec-titulo sec-titulo--green">Haberes Imponibles</h4>
      <div class="liq-tabla">
        ${filaTabla('Sueldo Base', haberes.sueldoBase)}
        ${haberes.horasExtra ? filaTabla('Horas Extra', haberes.horasExtra) : ''}
        ${haberes.bono ? filaTabla('Bonificación', haberes.bono) : ''}
        ${haberes.otros ? filaTabla('Otros haberes imponibles', haberes.otros) : ''}
        <div class="tabla-subtotal"><span>Subtotal Imponible</span><span>${fmt(totales.totalImponible)}</span></div>
      </div>
    </div>

    <div class="liq-seccion">
      <h4 class="sec-titulo sec-titulo--blue">Haberes No Imponibles</h4>
      <div class="liq-tabla">
        ${haberes.colacion ? filaTabla('Colación', haberes.colacion) : ''}
        ${haberes.movilizacion ? filaTabla('Movilización', haberes.movilizacion) : ''}
        <div class="tabla-subtotal"><span>Subtotal No Imponible</span><span>${fmt(totales.totalNoImponible)}</span></div>
      </div>
    </div>

    <div class="liq-seccion">
      <h4 class="sec-titulo sec-titulo--red">Descuentos</h4>
      <div class="liq-tabla">
        ${filaTabla('AFP (' + (emp?.afp || 'AFP') + ')', descuentos.afp, true)}
        ${filaTabla('Salud (' + (emp?.salud || 'Salud') + ')', descuentos.salud, true)}
        ${filaTabla('Seguro Cesantía', descuentos.cesantia, true)}
        ${descuentos.anticipo ? filaTabla('Anticipo de sueldo', descuentos.anticipo, true) : ''}
        ${descuentos.prestamo ? filaTabla('Préstamo', descuentos.prestamo, true) : ''}
        ${descuentos.otros ? filaTabla('Otros descuentos', descuentos.otros, true) : ''}
        <div class="tabla-subtotal tabla-subtotal--red"><span>Total Descuentos</span><span>${fmt(totales.totalDescuentos)}</span></div>
      </div>
    </div>

    <div class="liq-total">
      <span class="total-label">LÍQUIDO A PAGAR</span>
      <span class="total-monto">${fmt(totales.liquidoPagar)}</span>
    </div>

    <p class="liq-firma">Documento generado electrónicamente · ${new Date().toLocaleDateString('es-CL')}</p>
  `;

  panel.classList.remove('oculto');
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function filaTabla(label, valor, descuento = false) {
  return `<div class="tabla-fila">
    <span>${label}</span>
    <span class="${descuento ? 'monto-desc' : ''}">${descuento ? '- ' : ''}${fmt(valor)}</span>
  </div>`;
}

function ocultarDetalle() {
  document.getElementById('panel-detalle').classList.add('oculto');
  liquidacionActiva = null;
  renderLista();
}

// ── Imprimir ──────────────────────────────────────
function imprimirLiquidacion() {
  if (!liquidacionActiva) return;
  window.print();
}

// ── Descargar ─────────────────────────────────────
function descargarLiquidacion() {
  if (!liquidacionActiva) return;
  const liq = liquidacionActiva;
  const emp = Storage.getEmpleado();
  const { haberes, descuentos, totales, periodo, fechaPago, diasTrabajados } = liq;

  const lineas = [
    '═══════════════════════════════════════════════════════',
    '              LIQUIDACIÓN DE SUELDO',
    `              ${nombreMes(periodo.mes).toUpperCase()} ${periodo.año}`,
    '═══════════════════════════════════════════════════════',
    '',
    '── DATOS DEL TRABAJADOR ───────────────────────────────',
    emp ? `Nombre         : ${emp.nombre}` : '',
    emp ? `RUT            : ${emp.rut}` : '',
    emp ? `Cargo          : ${emp.cargo}` : '',
    emp ? `Empresa        : ${emp.empresa}` : '',
    emp ? `AFP            : ${emp.afp}` : '',
    emp ? `Salud          : ${emp.salud}` : '',
    `Fecha de pago  : ${new Date(fechaPago + 'T00:00:00').toLocaleDateString('es-CL')}`,
    `Días trabajados: ${diasTrabajados}`,
    '',
    '── HABERES IMPONIBLES ─────────────────────────────────',
    `Sueldo Base          : ${fmt(haberes.sueldoBase)}`,
    haberes.horasExtra ? `Horas Extra          : ${fmt(haberes.horasExtra)}` : '',
    haberes.bono       ? `Bonificación         : ${fmt(haberes.bono)}` : '',
    `SUBTOTAL IMPONIBLE   : ${fmt(totales.totalImponible)}`,
    '',
    '── HABERES NO IMPONIBLES ──────────────────────────────',
    haberes.colacion      ? `Colación             : ${fmt(haberes.colacion)}` : '',
    haberes.movilizacion  ? `Movilización         : ${fmt(haberes.movilizacion)}` : '',
    `SUBTOTAL NO IMPONIBLE: ${fmt(totales.totalNoImponible)}`,
    '',
    '── DESCUENTOS ─────────────────────────────────────────',
    `AFP                  : -${fmt(descuentos.afp)}`,
    `Salud                : -${fmt(descuentos.salud)}`,
    `Seguro Cesantía      : -${fmt(descuentos.cesantia)}`,
    descuentos.anticipo ? `Anticipo             : -${fmt(descuentos.anticipo)}` : '',
    `TOTAL DESCUENTOS     : -${fmt(totales.totalDescuentos)}`,
    '',
    '═══════════════════════════════════════════════════════',
    `  LÍQUIDO A PAGAR    : ${fmt(totales.liquidoPagar)}`,
    '═══════════════════════════════════════════════════════',
    '',
    `Generado el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}`,
  ].filter(l => l !== undefined && l !== null);

  const texto = lineas.join('\n');
  const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Liquidacion_${nombreMes(periodo.mes)}_${periodo.año}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  mostrarAlerta('Liquidación descargada correctamente.');
}
