'use strict';
const express = require('express');
const app = express();

app.use('/static', express.static(`${__dirname}/static`));
app.set('view engine', 'pug');
app.set('views', `${__dirname}/views`);

app.get('/', (req, res) => {
    res.render('index');
})

app.listen('8000', () => {
    console.log('listening :8000');
});