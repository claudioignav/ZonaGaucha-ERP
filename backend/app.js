const express = require('express');
const { manejarErrores, rutaNoEncontrada } = require('./middleware/manejarErrores');
const authenticateToken = require('./middleware/authenticateToken');
const verifyAdmin = require('./middleware/verifyAdmin');

const app = express();

app.disable('x-powered-by');

app.use(require('./middleware/cors'));

app.use(express.json({ limit: '100kb' }));

app.use('/', require('./routes/estado'));

app.use('/auth', require('./routes/auth'));

app.use('/usuarios', authenticateToken, verifyAdmin, require('./routes/usuarios'));

app.use('/catalogos', authenticateToken, require('./routes/catalogos'));

app.use('/compras', authenticateToken, require('./routes/compras'));

app.use(rutaNoEncontrada);

app.use(manejarErrores);

module.exports = app;
