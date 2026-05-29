const Producto = require('../models/Producto');
const { registrarProducto, obtenerCatalogo, obtenerProductoPorCodigo } = require('../services/productoService');

// Registrar producto nuevo
const crearProducto = (req, res) => {
  const { codigo, nombre, grupo, subgrupo, fotografia, stockMinimo, stockMaximo, stockActual } = req.body;

  if (!codigo || !nombre || !grupo) {
    return res.status(400).json({ error: 'codigo, nombre y grupo son requeridos.' });
  }

  try {
    const producto = new Producto(codigo, nombre, grupo, subgrupo, fotografia, stockMinimo, stockMaximo, stockActual);
    const resultado = registrarProducto(producto);
    return res.status(201).json({ mensaje: 'Producto registrado correctamente.', producto: resultado });
  } catch (error) {
    return res.status(409).json({ error: error.message });
  }
};

// Ver catálogo completo
const verCatalogo = (req, res) => {
  const productos = obtenerCatalogo();
  return res.status(200).json({ total: productos.length, catalogo: productos });
};

// Ver stock de un producto
const verStock = (req, res) => {
  const { codigo } = req.params;
  const producto = obtenerProductoPorCodigo(codigo);
  if (!producto) {
    return res.status(404).json({ error: `Producto con código ${codigo} no encontrado.` });
  }
  return res.status(200).json({
    codigo: producto.codigo,
    nombre: producto.nombre,
    stockActual: producto.stockActual,
    stockMinimo: producto.stockMinimo,
    stockMaximo: producto.stockMaximo,
    alerta: producto.stockActual <= producto.stockMinimo ? '⚠️ Stock bajo mínimo' : '✅ Stock normal'
  });
};

module.exports = { crearProducto, verCatalogo, verStock };