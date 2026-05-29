// modulos/inventario/ERPS 11/routes/bodegaRoutes.js

const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/bodegaController');

// Bodegas
router.post('/',          ctrl.crearBodega);
router.get('/',           ctrl.listarBodegas);
router.get('/:id',        ctrl.obtenerBodega);

// Movimientos
router.post('/movimientos',  ctrl.registrarMovimiento);
router.get('/movimientos',   ctrl.listarMovimientos);

// Reporte
router.get('/reporte/stock', ctrl.reporteStock);

module.exports = router;