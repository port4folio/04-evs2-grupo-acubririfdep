const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('ERP Seguridad LTDA - API corriendo');
});

const liquidacionRoutes = require('./src/modules/rrhh/routes/liquidacionRoutes');
app.use('/api/rrhh', liquidacionRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log('Servidor corriendo en http://localhost:' + PORT);
});

module.exports = app;


