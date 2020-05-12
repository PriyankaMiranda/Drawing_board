var express = require('express');
const cookieSession = require('cookie-session');
const keys = require('./routes');
var app = express();

app.use(
	cookieSession({maxAge: 30*24*60*60*1000,
		keys: [keys.cookieKey]})
	);

const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
	

app.use(express.static(__dirname + '/public/login'));



// app.use(express.static(__dirname + '/public'));
// function onConnection(socket){
//   socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
// }
// io.on('connection', onConnection);


http.listen(port, () => console.log('listening on port ' + port));