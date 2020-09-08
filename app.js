const express = require("express");
const path = require("path");
var fs = require("fs");
const routes = require("./routes");
const cookieSession = require("cookie-session");
const keys = require("./keys");
const port = process.env.PORT || 5000;
const app = express();

// Set the default views directory to html folder
app.set("views", path.join(__dirname, "html"));
// Set the folder for css
app.use(express.static(path.join(__dirname, "css")));
// Set the folder for java script
app.use(express.static(path.join(__dirname, "js")));
// Set the folder for assets
app.use(express.static(path.join(__dirname, "assets")));
app.use(express.static(path.join(__dirname, "node_modules")));

// Set the view engine to ejs
app.set("view engine", "ejs");
app.use("/", routes);

app.use(
	cookieSession({ maxAge: 30 * 24 * 60 * 60 * 1000, keys: [keys.cookieKey] })
);

const server = app.listen(port, () => {
	console.log("Server is running at port " + port);
});

var io = require("socket.io")(server);
var ejs = require("ejs");


var gameOwner = {};


var playerData = {};
var gameOngoing = {};


var gameData = {};

var gameStarted = {};
var gameTarget = {};

var gameWords = {};
var gameWord = {};
var gameClue = {};

var gameTotalRounds = {};
var gameCurrentRound = {};
var gameRoundComplete = {};

var gameTotalTime = {};
var gameTimeLeft = {};


io.on("connection", (socket) => {


// --------------------------------------------------------------------------
// ---------------------------------HOMEPAGE---------------------------------
// --------------------------------------------------------------------------
socket.on("get ongoing games", () => socket.broadcast.emit("get ongoing games", {id:socket.id}));

socket.on("send game data", (data) => io.to(data.id).emit('send game data', {gameID:data.gameID,img:data.img}));

socket.on("check match", (data) => socket.to(data.gameID).emit('check match', {gamePWD:data.gamePWD,id:socket.id}));

socket.on("send issue",(data) => io.to(data.id).emit('issue'));

socket.on("no issue",(data) => io.to(data.id).emit('no issue'));

socket.on("join game",(data) => socket.join(data.gameID));

socket.on("load chars", (data) => {
	socket.join(data.gameID);
	socket.to(data.gameID).emit('get chars', {id:socket.id});
});

socket.on("send chars", (data) => io.to(data.id).emit('hide chars', {img: data.img}));

socket.on("send chars when entering", (data) => {
	socket.join(data.gameID);
	socket.to(data.gameID).emit('hide chars', {id:socket.id,img:data.img});
});

// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------




// --------------------------------------------------------------------------
// -----------------------------------LOBBY----------------------------------
// --------------------------------------------------------------------------

socket.on("load chars on lobby", (data) => {	
	if(gameOwner[data.gameID] == undefined) {
		gameOwner[data.gameID] = socket.id
	}
	socket.username = data.username;
	socket.gameID = data.gameID;
	socket.gamePWD = data.gamePWD;
	socket.join(data.gameID);
	socket.emit("load chars on lobby");
	socket.to(data.gameID).emit("load chars on lobby");	
});

socket.on("display chars for lobby", (data) => {
	socket.emit("display chars for lobby", {username:data.username,img:data.img,id:socket.id,owner:gameOwner[data.gameID]});
	socket.to(data.gameID).emit("display chars for lobby", {username:data.username,img:data.img,id:socket.id,owner:gameOwner[data.gameID]});
});

socket.on("load old chars on lobby", (data) => socket.to(data.gameID).emit("load old chars on lobby",data));

socket.on("display old chars for lobby", (data) => io.to(data.is).emit("display chars for lobby", {username:data.username,img:data.img,id:socket.id,owner:gameOwner[data.gameID]}));

socket.on("enter game", (data) => {
	socket.emit("enter game");
	socket.to(data.gameID).emit("enter game");	
});

// when the client emits 'new message', this listens and executes
socket.on("new message", (data) => {
	socket.username = data.username;
	socket.message = data.message;
	socket.gameID = data.gameID;
	socket.gamePWD = data.gamePWD;

	// we tell the client to execute 'new message'
	socket.to(data.gameID).emit("new message",{
		username: socket.username,
		message: socket.message,
		gameID: socket.gameID,
		gamePWD: socket.gamePWD
	});

});

// when the client emits 'typing', we broadcast it to others
socket.on("typing", (data) => socket.to(data.gameID).emit("typing", data));

// when the client emits 'stop typing', we broadcast it to others
socket.on("stop typing", (data) => socket.to(data.gameID).emit("stop typing", data));

// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------



// --------------------------------------------------------------------------
// -----------------------------------GAME-----------------------------------
// --------------------------------------------------------------------------

socket.on('drawing', (data) => socket.to(data.gameID).emit('drawing', data));

// when the client emits 'new message', this listens and executes
socket.on("new message in game", (data) => {
	socket.username = data.username;
	socket.message = data.message;
	socket.gameID = data.gameID;
	socket.gamePWD = data.gamePWD;

	// we tell the client to execute 'new message'
	socket.to(data.gameID).emit("new message in game",{
		username: socket.username,
		message: socket.message,
		gameID: socket.gameID,
		gamePWD: socket.gamePWD
	});

});

// when the client emits 'typing', we broadcast it to others
socket.on("typing in game", (data) => socket.to(data.gameID).emit("typing in game", data));

// when the client emits 'stop typing', we broadcast it to others
socket.on("stop typing in game", (data) => socket.to(data.gameID).emit("stop typing in game", data));

socket.on("join game", (data) => {
	socket.join(data.gameID);
	// ---------------------------------------------------------------------------------------------------
	// ------for now we set these variables to constant values. we can later allow user to set these!-----
	var totalRounds = 3
	var words = []
	var clues = []
	var clues1 = []
	var clues2 = []
	for( var j = 0; j < totalRounds; j++){
		var gameWordList = fs.readFileSync("./assets/words/easy_words.txt", "utf-8").split("\n");
		var word = gameWordList[Math.floor(Math.random()*(gameWordList.length))];

		clue = "";
		word.split(" ").forEach(function(letter) {
			clue = clue + letter.replace(/./g, '_&nbsp');
		});

		var clueLength = Math.ceil(40*word.length/100)
		var firstClueArr = []
		while(firstClueArr.length != clueLength){
			var loc = Math.floor(Math.random() * word.length)
			if(!firstClueArr.includes(loc)){ firstClueArr.push(loc) }
		}
		var indexToSplit = Math.floor(firstClueArr.length/2);
		var first = firstClueArr.slice(0, indexToSplit);

		var clueArr = []
		var clueArr2 = []
		for( var i = 0; i < word.length; i++ ){
			if( firstClueArr.includes(i) ){ clueArr.push(word[i]) }
			else{ clueArr.push('_') }
			if( first.includes(i) ){ clueArr2.push(word[i]) }
			else{ clueArr2.push('_') }
		}

		var clue1 = "";
		var clue2 = "";
		clueArr2.forEach(function(letter) {
			clue1 = clue1 + letter+'&nbsp'
		});
		clueArr.forEach(function(letter) {
			clue2 = clue2 + letter+'&nbsp'
		});

		words.push(word)
		clues.push(clue)
		clues1.push(clue1)
		clues2.push(clue2)
	}

	playerData[socket.id] = {gameID : data.gameID, totalRounds : totalRounds, totalTime : 6, gameWords : words, 
							clues: clues, clues1: clues1, clues2 : clues2, score : 0, nextPlayer : undefined}
	console.log(playerData)
	// ---------------------------------------------------------------------------------------------------
});



socket.on("start game", (data) => {	

	if (gameOngoing[data.gameID] == undefined || gameOngoing[data.gameID] == false ) {	
		gameOngoing[data.gameID] = true
		
		var currentClients = Object.keys(io.sockets.adapter.rooms[data.gameID].sockets);
		currentClients.push(currentClients[0])
		
		var userOrder = []

		for( var i = 0; i < currentClients.length - 1; i++ ){
			if(playerData[currentClients[i]]){
				playerData[currentClients[i]].nextPlayer = currentClients[i+1]
			}
		}

		io.to(socket.id).emit('set data',{words : playerData[socket.id].gameWords,
											clues : playerData[socket.id].clues,
											clues1 : playerData[socket.id].clues1,
											clues2 : playerData[socket.id].clues2,
											time : playerData[socket.id].totalTime,
											totalRounds : playerData[socket.id].totalRounds});

	}else{
		if(playerData[socket.id].nextPlayer == undefined){
			var currentClients = Object.keys(io.sockets.adapter.rooms[data.gameID].sockets);
			playerData[socket.id].nextPlayer = currentClients[0]
			playerData[currentClients[currentClients.length]].nextPlayer = socket.id
		}
	}	
});

socket.on("set clue", (data) => {
	socket.to(data.gameID).emit("set clue",{clue : data.clue, time : data.time})
});

socket.on("next round", (data) => {
	playerData[socket.id].totalRounds -= 1
	var nextPlayer = playerData[socket.id].nextPlayer
	io.to(nextPlayer).emit('set data',{words : playerData[nextPlayer].gameWords,
										clues : playerData[nextPlayer].clues,
										clues1 : playerData[nextPlayer].clues1,
										clues2 : playerData[nextPlayer].clues2,
										time : playerData[nextPlayer].totalTime,
										totalRounds : playerData[nextPlayer].totalRounds});
});



// socket.on("end round", (data) => {
// 	if(gameOngoing[data.gameID] == true){ 
// 		console.log("game ended")
// 		gameOngoing[data.gameID] = false 

// 		gameWord[data.gameID] = gameWords[data.gameID][gameWords[data.gameID].findIndex(gameWord[data.gameID])+ 1]
// 		gameWord[data.gameID] = gameWordList[Math.floor(Math.random()*(gameWordList.length))]
		
// 		gameClue[data.gameID] = {}
// 		gameClue[data.gameID][0] = "";
// 		gameWord[data.gameID].split(" ").forEach(function(letter) {
// 			gameClue[data.gameID][0] = gameClue[data.gameID][0] + letter.replace(/./g, '_&nbsp');
// 		});

// 		var clueLength = Math.ceil(40*gameWord[data.gameID].length/100)
// 		var firstClueArr = []
// 		while(firstClueArr.length != clueLength){
// 			var loc = Math.floor(Math.random() * gameWord[data.gameID].length)
// 			if(!firstClueArr.includes(loc)){ firstClueArr.push(loc) }
// 		}
// 		var indexToSplit = Math.floor(firstClueArr.length/2);
// 		var first = firstClueArr.slice(0, indexToSplit);

// 		var clueArr = []
// 		var clueArr2 = []
// 		for( var i = 0; i < gameWord[data.gameID].length; i++ ){
// 			if(firstClueArr.includes(i)){ clueArr.push(gameWord[data.gameID][i]) }
// 			else{ clueArr.push('_') }
// 			if(first.includes(i)){ clueArr2.push(gameWord[data.gameID][i]) }
// 			else{ clueArr2.push('_') }
// 		}

// 		gameClue[data.gameID][1] = "";
// 		gameClue[data.gameID][2] = "";
// 		clueArr2.forEach(function(letter) {
// 			gameClue[data.gameID][1] = gameClue[data.gameID][1] + letter+'&nbsp'
// 		});
// 		clueArr.forEach(function(letter) {
// 			gameClue[data.gameID][2] = gameClue[data.gameID][2] + letter+'&nbsp'
// 		});

// 		socket.emit("start game");	
// 	}
// });
	
socket.on("show answer", (data) => socket.emit("show answer", {word:gameWord[data.gameID]}));

socket.on("check answer", (data) => {
	if(data.message == gameWord[data.gameID]){
		socket.emit("dont show message",data)
		score = (gameTimeLeft[data.gameID])*100/gameTotalTime[data.gameID];
		gameData[data.gameID][socket.id][0] += score
		gameData[data.gameID][socket.id][1] += 1
		// socket.emit("update score",{score:gameData[data.gameID][socket.id][0],id:socket.id})
		// socket.to(data.gameID).emit("update score",{score:gameData[data.gameID][socket.id][0],id:socket.id})
	}else{
		socket.emit("new message in game",data)
	}

});

// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------


// --------------------------------------------------------------------------
// -------------------------------DISCONNECTION------------------------------
// --------------------------------------------------------------------------
	// when the user disconnects.. perform this
	socket.on("disconnect", () => {
		if (socket.gameID){
			socket.leave(socket.gameID);
			if(socket.id == gameOwner[socket.gameID]){
				gameOwner[socket.gameID] = undefined
			}
			socket.to(socket.gameID).emit("reload lobby page", {gameID : socket.gameID});
			
			// socket.broadcast.emit("get chars for reloading upon disconnection");
			// socket.broadcast.emit("user left", {username: socket.username});			
		}
	});
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------



});
