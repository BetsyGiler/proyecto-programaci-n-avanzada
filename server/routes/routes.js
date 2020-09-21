const express = require('express');
const app = express();

app.use(require('./user'));
app.use(require('./courses'));
app.use(require('./parallels'));

module.exports = app;