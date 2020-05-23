const express = require('express');
const path = require('path');
const routes = require('./routes');
const cookieSession = require('cookie-session');
const keys = require('./constants');

const app = express();

// Set the default views directory to html folder
app.set('views', path.join(__dirname, 'html'));
// Set the folder for css 
app.use(express.static(path.join(__dirname,'css')));
// Set the folder for java script
app.use(express.static(path.join(__dirname,'js')));
// Set the folder for assets
app.use(express.static(path.join(__dirname,'assets')));
app.use(express.static(path.join(__dirname, 'node_modules')));

// Set the view engine to ejs
app.set('view engine', 'ejs');

app.use('/', routes);

app.use(
	cookieSession({maxAge: 30*24*60*60*1000,
		keys: [keys.cookieKey]})
	);


const server = app.listen(3000, () => {
  console.log('Server is running at localhost:3000');
});

var io = require('socket.io')(server);
var ejs = require('ejs');



// function onConnection(socket){
//   socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
// }
// io.on('connection', onConnection);

// function onSelectAvatar(socket){
//   socket.on('userdata', (data) => socket.broadcast.emit('userdata', data));
  
// }
// io.on('connection_2', onSelectAvatar);


// Chatroom

var numUsers = 0;

io.on('connection', (socket) => {
  var addedUser = false;
  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
























