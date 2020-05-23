const express = require('express');
const router = express.Router();

// routes 

router.get('/', (req, res) => {
  res.render('home');
});

router.get('/lobby', (req, res) => {
	res.render('lobby');
});

router.get('/game', (req, res) => {
	res.render('game');
});

module.exports = router;

// var express = require('express');
// const mongoose = require("mongoose");
// const cookieSession = require('cookie-session');
// const keys = require('./routes');
// var app = express();
// var blocked = []

// app.use(
// 	cookieSession({maxAge: 30*24*60*60*1000,
// 		keys: [keys.cookieKey]})
// 	);

// const http = require('http').Server(app);
// const io = require('socket.io')(http);
// const port = process.env.PORT || 3000;
