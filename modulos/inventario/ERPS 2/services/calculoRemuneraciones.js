/**
 * Calcula la liquidación de sueldo de un empleado.
 * @param {Liquidacion} params - Parámetros de la liquidación
 * @returns {Object} Resultado con totalHaberes, totalDescuentos y sueldoLiquido
 */
function calcularLiquidacion(params) {
  const { sueldoBase, haberes, descuentos } = params;

  // Sumar todos los haberes adicionales
  const totalHaberes = haberes.reduce((acc, h) => acc + h.monto, 0);

  // Base imponible = sueldo base + haberes
  const baseImponible = sueldoBase + totalHaberes;

  // Calcular descuentos sobre la base imponible
  const totalDescuentos = descuentos.reduce((acc, d) => {
    return acc + (baseImponible * d.porcentaje) / 100;
  }, 0);

  // Sueldo líquido final
  const sueldoLiquido = baseImponible - totalDescuentos;

  return {
    sueldoBase,
    totalHaberes,
    baseImponible,
    totalDescuentos: Math.round(totalDescuentos),
    sueldoLiquido: Math.round(sueldoLiquido),
    detalle: {
      haberes,
      descuentos,
    },
  };
}

module.exports = { calcularLiquidacion };