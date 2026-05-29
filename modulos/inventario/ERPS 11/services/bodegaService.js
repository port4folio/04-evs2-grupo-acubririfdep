// modulos/inventario/ERPS 11/services/bodegaService.js

const Bodega     = require('../models/Bodega');
const Movimiento = require('../models/Movimiento');

// Importar catálogo del ERPS-10 para validar productos
const { catalogo } = require('../../ERPS 10/services/productoService');

let bodegas     = [];
let movimientos = [];
let nextBodegaId = 1;
let nextMovId    = 1;

// ── Bodegas ──────────────────────────────────────────────

function crearBodega(datos) {
  const existe = bodegas.find(b => b.nombre.toLowerCase() === datos.nombre.toLowerCase());
  if (existe) throw new Error(`Ya existe una bodega con el nombre "${datos.nombre}"`);

  const bodega = new Bodega({ ...datos, id: `BOD-${String(nextBodegaId++).padStart(3, '0')}` });
  bodegas.push(bodega);
  return bodega;
}

function listarBodegas() {
  return bodegas;
}

function obtenerBodega(id) {
  const b = bodegas.find(b => b.id === id);
  if (!b) throw new Error(`Bodega "${id}" no encontrada`);
  return b;
}

// ── Movimientos ──────────────────────────────────────────

function registrarMovimiento(datos) {
  const bodega = obtenerBodega(datos.bodegaId);

  // Validar que el producto existe en ERPS-10
  const producto = catalogo.find(p => p.codigo === datos.codigoProducto);
  if (!producto) throw new Error(`Producto "${datos.codigoProducto}" no existe en el catálogo`);

  if (!['entrada', 'salida'].includes(datos.tipo)) {
    throw new Error('Tipo de movimiento inválido. Use "entrada" o "salida"');
  }

  const stockActual = bodega.stock[datos.codigoProducto] || 0;

  if (datos.tipo === 'salida' && datos.cantidad > stockActual) {
    throw new Error(`Stock insuficiente en bodega. Disponible: ${stockActual}`);
  }

  // Actualizar stock en la bodega
  if (datos.tipo === 'entrada') {
    bodega.stock[datos.codigoProducto] = stockActual + datos.cantidad;
  } else {
    bodega.stock[datos.codigoProducto] = stockActual - datos.cantidad;
  }

  // Actualizar stockActual del producto en ERPS-10
  if (datos.tipo === 'entrada') {
    producto.stockActual += datos.cantidad;
  } else {
    producto.stockActual -= datos.cantidad;
  }

  const mov = new Movimiento({ ...datos, id: `MOV-${String(nextMovId++).padStart(4, '0')}` });
  movimientos.push(mov);
  return mov;
}

function listarMovimientos(bodegaId) {
  if (bodegaId) return movimientos.filter(m => m.bodegaId === bodegaId);
  return movimientos;
}

function reporteStockPorBodega() {
  return bodegas.map(b => ({
    id:        b.id,
    nombre:    b.nombre,
    ubicacion: b.ubicacion,
    stock:     b.stock
  }));
}

module.exports = { crearBodega, listarBodegas, obtenerBodega, registrarMovimiento, listarMovimientos, reporteStockPorBodega };