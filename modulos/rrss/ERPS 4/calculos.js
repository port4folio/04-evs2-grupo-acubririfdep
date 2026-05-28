/**
 * calculos.js
 * Lógica de cálculo de impacto en remuneraciones por licencias médicas.
 * Reemplaza a documentos.js de la app de contratos.
 */

const Calculos = (() => {

  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                 'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  const TIPO_LABEL = {
    comun:        'Enfermedad común',
    laboral:      'Accidente laboral',
    maternal:     'Maternal',
    paternal:     'Postnatal paternal',
    catastrofica: 'Catastrófica',
  };

  /**
   * Devuelve la cantidad de días que una licencia cae dentro del mes/año dado.
   * @param {string} inicioStr - fecha ISO inicio licencia
   * @param {string} terminoStr - fecha ISO término licencia
   * @param {number} mes  - 1-12
   * @param {number} anio
   * @returns {number} días solapados
   */
  function diasEnMes(inicioStr, terminoStr, mes, anio) {
    const inicio  = new Date(inicioStr + 'T00:00:00');
    const termino = new Date(terminoStr + 'T00:00:00');

    const primerDiaMes = new Date(anio, mes - 1, 1);
    const ultimoDiaMes = new Date(anio, mes, 0); // último día del mes

    const desde = inicio  > primerDiaMes ? inicio  : primerDiaMes;
    const hasta = termino < ultimoDiaMes ? termino : ultimoDiaMes;

    if (hasta < desde) return 0;
    return Math.round((hasta - desde) / 86400000) + 1;
  }

  /**
   * Calcula el total de días del mes (28/29/30/31).
   */
  function diasDelMes(mes, anio) {
    return new Date(anio, mes, 0).getDate();
  }

  /**
   * Calcula el impacto mensual de licencias en las remuneraciones.
   * @param {number} mes  1-12
   * @param {number} anio
   * @returns {Array} líneas de resultado por empleado
   */
  function calcularImpactoMensual(mes, anio) {
    const empleados = Storage.getEmpleados();
    const licencias  = Storage.getLicencias();
    const totalDias  = diasDelMes(mes, anio);
    const resultados  = [];

    for (const emp of empleados) {
      // Licencias del empleado que tocan este mes
      const licsEmp = licencias.filter(l => {
        if (l.empleadoId !== emp.id) return false;
        const dias = diasEnMes(l.inicio, l.termino, mes, anio);
        return dias > 0;
      });

      if (licsEmp.length === 0) continue; // No tiene licencias este mes

      let diasLicTotal   = 0;
      let subsidioTotal  = 0;

      const detalle = licsEmp.map(l => {
        const dias = diasEnMes(l.inicio, l.termino, mes, anio);
        const pct  = Number(l.subsidio) / 100;
        // Subsidio diario = (sueldo / días del mes) * % subsidio
        const subsidio = Math.round((emp.sueldo / totalDias) * dias * pct);
        diasLicTotal  += dias;
        subsidioTotal += subsidio;
        return { ...l, diasEnMes: dias, subsidio };
      });

      const diasTrabajados  = Math.max(0, totalDias - diasLicTotal);
      const sueldoProporcional = Math.round((emp.sueldo / totalDias) * diasTrabajados);
      const remuneracionTotal  = sueldoProporcional + subsidioTotal;

      resultados.push({
        emp,
        diasLicTotal,
        diasTrabajados,
        sueldoProporcional,
        subsidioTotal,
        remuneracionTotal,
        descuento: emp.sueldo - remuneracionTotal,
        detalle,
      });
    }

    return resultados;
  }

  /**
   * Genera el texto exportable de remuneraciones.
   */
  function generarResumenTxt(mes, anio, resultados) {
    const nombreMes = MESES[mes - 1];
    const sep = '─'.repeat(70);
    let txt = '';
    txt += `${'═'.repeat(70)}\n`;
    txt += `  RESUMEN DE REMUNERACIONES — ${nombreMes.toUpperCase()} ${anio}\n`;
    txt += `  Módulo: Licencias Médicas — Sistema RRHH\n`;
    txt += `${'═'.repeat(70)}\n\n`;

    if (resultados.length === 0) {
      txt += '  No se registraron licencias médicas para este período.\n';
    } else {
      for (const r of resultados) {
        txt += `EMPLEADO : ${r.emp.nombre} (${r.emp.rut})\n`;
        txt += `Cargo    : ${r.emp.cargo} — ${r.emp.departamento || 'Sin depto.'}\n`;
        txt += `Sueldo base: $${r.emp.sueldo.toLocaleString('es-CL')}\n`;
        txt += `${sep}\n`;
        txt += `  Días del mes     : ${diasDelMes(mes, anio)}\n`;
        txt += `  Días con licencia: ${r.diasLicTotal}\n`;
        txt += `  Días trabajados  : ${r.diasTrabajados}\n`;
        txt += `\n  Detalle licencias:\n`;
        for (const d of r.detalle) {
          txt += `    • ${TIPO_LABEL[d.tipo] || d.tipo}: ${d.diasEnMes} días → Subsidio $${d.subsidio.toLocaleString('es-CL')} (${d.subsidio}%)\n`;
        }
        txt += `\n`;
        txt += `  Sueldo proporcional : $${r.sueldoProporcional.toLocaleString('es-CL')}\n`;
        txt += `  Subsidio total      : $${r.subsidioTotal.toLocaleString('es-CL')}\n`;
        txt += `  REMUNERACIÓN NETA   : $${r.remuneracionTotal.toLocaleString('es-CL')}\n`;
        txt += `  Descuento aplicado  : $${r.descuento.toLocaleString('es-CL')}\n`;
        txt += `\n${'─'.repeat(70)}\n\n`;
      }
    }

    txt += `\nGenerado: ${new Date().toLocaleString('es-CL')}\n`;
    return txt;
  }

  /* ── Estadísticas ── */

  function estadisticasPorTipo(licencias) {
    const map = {};
    for (const l of licencias) {
      const t = l.tipo || 'comun';
      if (!map[t]) map[t] = { count: 0, dias: 0 };
      map[t].count++;
      map[t].dias += calcularDias(l.inicio, l.termino);
    }
    return map;
  }

  function estadisticasPorEmpleado(licencias, empleados) {
    const map = {};
    for (const l of licencias) {
      if (!map[l.empleadoId]) map[l.empleadoId] = { count: 0, dias: 0 };
      map[l.empleadoId].count++;
      map[l.empleadoId].dias += calcularDias(l.inicio, l.termino);
    }
    return Object.entries(map)
      .map(([id, v]) => {
        const emp = empleados.find(e => e.id === Number(id));
        return { nombre: emp ? emp.nombre : 'Desconocido', ...v };
      })
      .sort((a, b) => b.count - a.count);
  }

  function estadisticasPorMes(licencias) {
    const mapa = Array(12).fill(0);
    for (const l of licencias) {
      const d = new Date(l.inicio + 'T00:00:00');
      mapa[d.getMonth()]++;
    }
    return mapa;
  }

  function calcularDias(inicioStr, terminoStr) {
    if (!inicioStr || !terminoStr) return 0;
    const a = new Date(inicioStr + 'T00:00:00');
    const b = new Date(terminoStr + 'T00:00:00');
    return Math.max(0, Math.round((b - a) / 86400000) + 1);
  }

  function subsidioTotalAcumulado(licencias, empleados) {
    let total = 0;
    for (const l of licencias) {
      const emp = empleados.find(e => e.id === l.empleadoId);
      if (!emp) continue;
      const dias = calcularDias(l.inicio, l.termino);
      const diasMes = 30; // promedio
      const pct = Number(l.subsidio) / 100;
      total += Math.round((emp.sueldo / diasMes) * dias * pct);
    }
    return total;
  }

  return {
    calcularImpactoMensual,
    generarResumenTxt,
    estadisticasPorTipo,
    estadisticasPorEmpleado,
    estadisticasPorMes,
    calcularDias,
    subsidioTotalAcumulado,
    diasDelMes,
    MESES,
    TIPO_LABEL,
  };

})();
