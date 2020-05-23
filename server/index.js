var express = require('express');
const mongoose = require("mongoose");
const cookieSession = require('cookie-session');
const keys = require('./routes');
var app = express();
var connections = []

app.use(
	cookieSession({maxAge: 30*24*60*60*1000,
		keys: [keys.cookieKey]})
	);

const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;

app.get('/', (req, res)=>{ 
	res.render('home'); 
}); 

app.get('/lobby', (req, res)=>{ 
	res.render('lobby'); 
}); 

app.get('/game', (req, res)=>{ 
	res.render('game'); 
}); 

// app.use(express.static(__dirname + '/public'));

// app.get('/lobby', function(req, res) {
// 	res.render("/public/lobby/index.html");
// });

// app.get('/game', function(req, res) {
// 	res.render("/public/lobby5/game/index.html");
// });

function onConnection(socket){
	console.log("Socket connection established");
	connections.push(socket);
	console.log("connected: ",connections.length);
	socket.on('drawing', function(data) {
		socket.broadcast.emit('drawing', data);
		connections.splice(connections.indexOf(socket),1);
		console.log("connected: ",connections.length);
	}); 
}
io.on('connection', onConnection);



// function onSelectAvatar(socket){
//   socket.on('userdata', (data) => socket.broadcast.emit('userdata', data));
// }
// io.on('connection_2', onSelectAvatar);



http.listen(port, () => console.log('listening on port ' + port));