// modulos/inventario/ERPS 11/models/Movimiento.js

class Movimiento {
  constructor({ id, bodegaId, codigoProducto, tipo, cantidad, observacion }) {
    this.id              = id;
    this.bodegaId        = bodegaId;
    this.codigoProducto  = codigoProducto;
    this.tipo            = tipo;        // 'entrada' | 'salida'
    this.cantidad        = cantidad;
    this.observacion     = observacion || '';
    this.fecha           = new Date().toISOString();
  }
}

module.exports = Movimiento;