







const express = require('express');
const cookieSession = require('cookie-session');

const app = express();

const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;

var server = app.listen(PORT, function () {
    console.log('Node server is running..');
});

// app.use(express.static(__dirname + '/public'));

// function onConnection(socket){
//   socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
// }

// io.on('connection', onConnection);

// http.listen(port, () => console.log('listening on port ' + port));