
const cookieSession = require('cookie-session');

var express = require('express');
var app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;
var server = app.listen(port, function () {
    console.log('Node server is running..');
});






// var server = app.listen(PORT, function () {
//     console.log('Node server is running..');
// });