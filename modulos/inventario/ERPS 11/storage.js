/**
 * storage.js
 * Capa de persistencia en localStorage para la app de bodegas
 */

const KEYS = {
  BODEGAS: 'bodegas_lista',
  MOVIMIENTOS: 'bodegas_movs',
};

// ─── BODEGAS ────────────────────────────────────────────────
function getBodegas() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.BODEGAS)) || [];
  } catch { return []; }
}

function saveBodegas(lista) {
  localStorage.setItem(KEYS.BODEGAS, JSON.stringify(lista));
}

function addBodega(bodega) {
  const lista = getBodegas();
  lista.push(bodega);
  saveBodegas(lista);
}

function deleteBodega(id) {
  const lista = getBodegas().filter(b => b.id !== id);
  saveBodegas(lista);
}

function updateBodega(bodegaActualizada) {
  const lista = getBodegas().map(b =>
    b.id === bodegaActualizada.id ? bodegaActualizada : b
  );
  saveBodegas(lista);
}

// ─── MOVIMIENTOS ─────────────────────────────────────────────
function getMovimientos() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.MOVIMIENTOS)) || [];
  } catch { return []; }
}

function saveMovimientos(lista) {
  localStorage.setItem(KEYS.MOVIMIENTOS, JSON.stringify(lista));
}

function addMovimiento(mov) {
  const lista = getMovimientos();
  lista.unshift(mov); // más reciente primero
  saveMovimientos(lista);
}

function getMovimientosByBodega(bodegaId) {
  return getMovimientos().filter(m => m.bodegaId === bodegaId);
}

// ─── INVENTARIO: stock por bodega ────────────────────────────
function getStockBodega(bodegaId) {
  const movs = getMovimientosByBodega(bodegaId);
  const stock = {};
  movs.forEach(m => {
    if (!stock[m.producto]) stock[m.producto] = 0;
    if (m.tipo === 'entrada') stock[m.producto] += m.cantidad;
    if (m.tipo === 'salida')  stock[m.producto] -= m.cantidad;
  });
  return stock; // { nombreProducto: cantidad }
}

function getTotalUnidasBodega(bodegaId) {
  const stock = getStockBodega(bodegaId);
  return Object.values(stock).reduce((s, v) => s + v, 0);
}

// ─── RESET ───────────────────────────────────────────────────
function clearAll() {
  localStorage.removeItem(KEYS.BODEGAS);
  localStorage.removeItem(KEYS.MOVIMIENTOS);
}
