// modulos/inventario/ERPS 11/controllers/bodegaController.js

const svc = require('../services/bodegaService');

const crearBodega = (req, res) => {
  try {
    const bodega = svc.crearBodega(req.body);
    res.status(201).json({ mensaje: 'Bodega creada', bodega });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

const listarBodegas = (req, res) => {
  res.json({ bodegas: svc.listarBodegas() });
};

const obtenerBodega = (req, res) => {
  try {
    const bodega = svc.obtenerBodega(req.params.id);
    res.json({ bodega });
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
};

const registrarMovimiento = (req, res) => {
  try {
    const mov = svc.registrarMovimiento(req.body);
    res.status(201).json({ mensaje: 'Movimiento registrado', movimiento: mov });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

const listarMovimientos = (req, res) => {
  const { bodegaId } = req.query;
  res.json({ movimientos: svc.listarMovimientos(bodegaId) });
};

const reporteStock = (req, res) => {
  res.json({ reporte: svc.reporteStockPorBodega() });
};

module.exports = { crearBodega, listarBodegas, obtenerBodega, registrarMovimiento, listarMovimientos, reporteStock };