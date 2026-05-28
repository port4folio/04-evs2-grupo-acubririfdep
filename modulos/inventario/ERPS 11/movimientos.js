/**
 * movimientos.js
 * Lógica de negocio para movimientos de inventario
 */

// ─── REGISTRAR MOVIMIENTO ────────────────────────────────────
function registrarMovimiento({ bodegaId, tipo, producto, cantidad, notas }) {
  // Validar stock suficiente en salidas
  if (tipo === 'salida') {
    const stock = getStockBodega(bodegaId);
    const stockActual = stock[producto] || 0;
    if (cantidad > stockActual) {
      return {
        ok: false,
        error: `Stock insuficiente. Disponible: ${stockActual} unidad(es) de "${producto}".`
      };
    }
  }

  const bodega = getBodegas().find(b => b.id === bodegaId);
  if (!bodega) return { ok: false, error: 'Bodega no encontrada.' };

  const mov = {
    id        : Date.now(),
    bodegaId,
    bodegaNombre: bodega.nombre,
    tipo,           // 'entrada' | 'salida'
    producto,
    cantidad,
    notas     : notas || '',
    fecha     : new Date().toISOString(),
  };

  addMovimiento(mov);
  return { ok: true, movimiento: mov };
}

// ─── EXPORTAR CSV ─────────────────────────────────────────────
function exportarCSV() {
  const movs = getMovimientos();
  if (movs.length === 0) return;

  const header = ['Fecha', 'Bodega', 'Tipo', 'Producto', 'Cantidad', 'Notas'];
  const rows = movs.map(m => [
    new Date(m.fecha).toLocaleString('es-CL'),
    m.bodegaNombre,
    m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1),
    m.producto,
    m.cantidad,
    m.notas || ''
  ]);

  const csv = [header, ...rows]
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `historial_bodegas_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── RESUMEN GLOBAL ──────────────────────────────────────────
function getResumenGlobal() {
  const bodegas   = getBodegas();
  const movs      = getMovimientos();
  let totalUnidades = 0;

  bodegas.forEach(b => {
    totalUnidades += getTotalUnidasBodega(b.id);
  });

  return {
    totalBodegas  : bodegas.length,
    totalMovs     : movs.length,
    totalUnidades,
    totalEntradas : movs.filter(m => m.tipo === 'entrada').length,
    totalSalidas  : movs.filter(m => m.tipo === 'salida').length,
  };
}

// ─── FORMATEO DE FECHA ───────────────────────────────────────
function fmtFecha(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
