const express = require('express');
const router = express.Router();
const { ejecutarLiquidacion } = require('../controllers/liquidacionController');

// POST /api/rrhh/liquidacion
router.post('/liquidacion', ejecutarLiquidacion);

module.exports = router;