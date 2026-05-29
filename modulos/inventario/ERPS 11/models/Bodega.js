// modulos/inventario/ERPS 11/models/Bodega.js

class Bodega {
  constructor({ id, nombre, ubicacion, descripcion }) {
    this.id          = id;
    this.nombre      = nombre;
    this.ubicacion   = ubicacion;
    this.descripcion = descripcion || '';
    this.stock       = {}; // { codigoProducto: cantidad }
    this.creadoEn    = new Date().toISOString();
  }
}

module.exports = Bodega;