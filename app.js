const express = require('express');
var app = express();

app.use(express.static('.'));
app.listen(2055, () => console.log('started'));
