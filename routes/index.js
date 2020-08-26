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
