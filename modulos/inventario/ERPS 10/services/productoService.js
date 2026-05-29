// Catálogo en memoria (simula base de datos)
const catalogo = [];

/**
 * Registra un producto nuevo en el catálogo.
 * @param {Producto} producto
 * @returns {Object} Producto registrado
 */
function registrarProducto(producto) {
  const existe = catalogo.find(p => p.codigo === producto.codigo);
  if (existe) {
    throw new Error(`Ya existe un producto con el código ${producto.codigo}`);
  }
  catalogo.push(producto);
  return producto;
}

/**
 * Retorna todos los productos del catálogo.
 * @returns {Array} Lista de productos
 */
function obtenerCatalogo() {
  return catalogo;
}

/**
 * Busca un producto por su código.
 * @param {string} codigo
 * @returns {Object} Producto encontrado
 */
function obtenerProductoPorCodigo(codigo) {
  return catalogo.find(p => p.codigo === codigo) || null;
}

module.exports = { registrarProducto, obtenerCatalogo, obtenerProductoPorCodigo };