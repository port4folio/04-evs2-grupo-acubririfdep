/**
 * Modelo de parámetros para el cálculo de liquidación.
 * @param {string} empleadoId - ID del empleado
 * @param {number} sueldoBase - Sueldo base mensual en CLP
 * @param {Array} haberes - Lista de haberes adicionales [{nombre, monto}]
 * @param {Array} descuentos - Lista de descuentos [{nombre, porcentaje}]
 */
class Liquidacion {
  constructor(empleadoId, sueldoBase, haberes = [], descuentos = []) {
    this.empleadoId = empleadoId;
    this.sueldoBase = sueldoBase;
    this.haberes = haberes;       // ej: [{nombre: "Bono asistencia", monto: 50000}]
    this.descuentos = descuentos; // ej: [{nombre: "AFP", porcentaje: 10}]
  }
}

module.exports = Liquidacion;