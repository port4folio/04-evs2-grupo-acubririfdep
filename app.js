const express = require('express');
const app = express();

app.use(express.json());

const path = require('path');
app.use(express.static(path.join(__dirname, 'modulos/inventario/ERPS 10')));

app.get('/', (req, res) => {
  res.send('ERP Seguridad LTDA - API corriendo');
});

// ERPS 2 - RRHH
const liquidacionRoutes = require('./modulos/inventario/ERPS 2/routes/liquidacionRoutes');
app.use('/api/rrhh', liquidacionRoutes);

// ERPS 10 - Inventario
const productoRoutes = require('./modulos/inventario/ERPS 10/routes/productoRoutes');
app.use('/api/inventario', productoRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log('Servidor corriendo en http://localhost:' + PORT);
});

module.exports = app;