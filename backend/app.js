const express = require('express');
const { manejarErrores, rutaNoEncontrada } = require('./middleware/manejarErrores');

const app = express();

app.use(express.json({ limit: '100kb' }));

app.use('/', require('./routes/estado'));

app.use(rutaNoEncontrada);

app.use(manejarErrores);

module.exports = app;
