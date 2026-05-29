const express = require('express');
const router = express.Router();
const { crearProducto, verCatalogo, verStock } = require('../controllers/productoController');

router.post('/productos', crearProducto);         // Registrar producto
router.get('/productos', verCatalogo);            // Ver catálogo
router.get('/productos/:codigo/stock', verStock); // Ver stock

module.exports = router;