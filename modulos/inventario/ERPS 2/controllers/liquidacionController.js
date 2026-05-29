const { calcularLiquidacion } = require('../services/calculoRemuneraciones');
const Liquidacion = require('../models/Liquidacion');

/**
 * Ejecuta el cálculo de liquidación mensual para un empleado.
 * Recibe los parámetros vía POST y devuelve el resultado.
 */
const ejecutarLiquidacion = (req, res) => {
  const { empleadoId, sueldoBase, haberes, descuentos } = req.body;

  if (!empleadoId || !sueldoBase) {
    return res.status(400).json({ error: 'empleadoId y sueldoBase son requeridos.' });
  }

  const params = new Liquidacion(empleadoId, sueldoBase, haberes, descuentos);
  const resultado = calcularLiquidacion(params);

  return res.status(200).json({
    empleadoId,
    mes: new Date().toLocaleString('es-CL', { month: 'long', year: 'numeric' }),
    ...resultado,
  });
};

module.exports = { ejecutarLiquidacion };