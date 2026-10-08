const express = require('express');

const app = express();

app.get('/', (req, res) => res.json({ mensaje: 'api del erp zonagaucha funcionando' }));

app.listen(Number(process.env.PORT) || 3000, '127.0.0.1');
