/**
 * Modelo de Producto para el módulo de Inventario.
 * @param {string} codigo - Código alfanumérico único del producto
 * @param {string} nombre - Nombre del producto
 * @param {string} grupo - Grupo del producto
 * @param {string} subgrupo - Subgrupo del producto
 * @param {string} fotografia - URL o path de la fotografía
 * @param {number} stockMinimo - Nivel mínimo de stock
 * @param {number} stockMaximo - Nivel máximo de stock
 * @param {number} stockActual - Stock actual disponible
 */
class Producto {
  constructor(codigo, nombre, grupo, subgrupo, fotografia, stockMinimo, stockMaximo, stockActual) {
    this.codigo = codigo;
    this.nombre = nombre;
    this.grupo = grupo;
    this.subgrupo = subgrupo;
    this.fotografia = fotografia;
    this.stockMinimo = stockMinimo;
    this.stockMaximo = stockMaximo;
    this.stockActual = stockActual;
  }
}

module.exports = Producto;