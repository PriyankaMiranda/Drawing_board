const express = require('express');
const cookieSession = require('cookie-session');

const app = express();


const PORT = process.env.PORT || 3000;

var server = app.listen(PORT, function () {
    console.log('Node server is running..');
});


