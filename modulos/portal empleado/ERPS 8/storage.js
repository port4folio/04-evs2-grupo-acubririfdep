/**
 * storage.js
 * Manejo de datos en localStorage para la app de liquidaciones
 */

const Storage = (() => {
  const KEYS = {
    EMPLEADO: 'liq_empleado',
    LIQUIDACIONES: 'liq_liquidaciones',
  };

  // ── Empleado ──────────────────────────────────
  function getEmpleado() {
    const raw = localStorage.getItem(KEYS.EMPLEADO);
    return raw ? JSON.parse(raw) : null;
  }

  function setEmpleado(empleado) {
    localStorage.setItem(KEYS.EMPLEADO, JSON.stringify(empleado));
  }

  // ── Liquidaciones ─────────────────────────────
  function getLiquidaciones() {
    const raw = localStorage.getItem(KEYS.LIQUIDACIONES);
    return raw ? JSON.parse(raw) : [];
  }

  function getLiquidacion(id) {
    return getLiquidaciones().find(l => l.id === id) || null;
  }

  function addLiquidacion(liq) {
    const lista = getLiquidaciones();
    lista.push(liq);
    // Ordenar por fecha descendente
    lista.sort((a, b) => new Date(b.fechaPago) - new Date(a.fechaPago));
    localStorage.setItem(KEYS.LIQUIDACIONES, JSON.stringify(lista));
  }

  function clearAll() {
    localStorage.removeItem(KEYS.EMPLEADO);
    localStorage.removeItem(KEYS.LIQUIDACIONES);
  }

  // ── Datos de demostración ─────────────────────
  function cargarDemo() {
    const empleado = {
      nombre: 'Valentina Torres Muñoz',
      rut: '15.234.567-8',
      cargo: 'Analista de Sistemas',
      departamento: 'Tecnología',
      empresa: 'TechSolutions SpA',
      rutEmpresa: '76.543.210-K',
      fechaIngreso: '2021-03-01',
      afp: 'Provida',
      salud: 'Fonasa',
      banco: 'BancoEstado',
      cuentaBancaria: '****-4521',
    };
    setEmpleado(empleado);

    const meses = [
      { mes: 4, año: 2025 }, { mes: 3, año: 2025 }, { mes: 2, año: 2025 },
      { mes: 1, año: 2025 }, { mes: 12, año: 2024 }, { mes: 11, año: 2024 },
      { mes: 10, año: 2024 }, { mes: 9, año: 2024 }, { mes: 8, año: 2024 },
      { mes: 7, año: 2024 }, { mes: 6, año: 2024 }, { mes: 5, año: 2024 },
    ];

    const base = 1_450_000;
    meses.forEach(({ mes, año }) => {
      const horasExtra = Math.random() > 0.5 ? Math.round(Math.random() * 80_000 / 10_000) * 10_000 : 0;
      const bono = Math.random() > 0.6 ? Math.round(Math.random() * 120_000 / 10_000) * 10_000 : 0;
      const colacion = 60_000;
      const movilizacion = 40_000;
      const totalImponible = base + horasExtra + bono;
      const afpPct = 0.1027;
      const saludPct = 0.07;
      const cesantiaPct = 0.006;
      const descAfp = Math.round(totalImponible * afpPct);
      const descSalud = Math.round(totalImponible * saludPct);
      const descCesantia = Math.round(totalImponible * cesantiaPct);
      const totalDesc = descAfp + descSalud + descCesantia;
      const liquido = totalImponible + colacion + movilizacion - totalDesc;

      const diasMes = new Date(año, mes, 0).getDate();
      const liq = {
        id: `${año}-${String(mes).padStart(2, '0')}`,
        periodo: { mes, año },
        fechaPago: `${año}-${String(mes).padStart(2, '0')}-${diasMes}`,
        diasTrabajados: diasMes,
        haberes: {
          sueldoBase: base,
          horasExtra,
          bono,
          colacion,
          movilizacion,
          otros: 0,
        },
        descuentos: {
          afp: descAfp,
          salud: descSalud,
          cesantia: descCesantia,
          anticipo: 0,
          prestamo: 0,
          otros: 0,
        },
        totales: {
          totalImponible,
          totalNoImponible: colacion + movilizacion,
          totalDescuentos: totalDesc,
          liquidoPagar: liquido,
        },
      };
      addLiquidacion(liq);
    });
  }

  return { getEmpleado, setEmpleado, getLiquidaciones, getLiquidacion, addLiquidacion, clearAll, cargarDemo };
})();
