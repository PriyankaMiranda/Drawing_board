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
var gameStarted = {};
var gameData = {};
var gameWordList = {};
var gameWord = {};
var gameClue = {};
var gameTarget = {};

var gameRounds = {};
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

socket.on("start game", (data) => {
	
	if(gameData[data.gameID] == undefined){
		gameData[data.gameID] = {}
	}

	if(gameData[data.gameID][socket.id] == undefined){
		// gameData includes score, turn
		gameData[data.gameID][socket.id] = [0,0]
	}

	if(gameStarted[data.gameID] == undefined) {
		gameStarted[data.gameID] = true
		// --------------------for now we set these variables  to constant values--------------------
		// ------------------------------later allow user to set these!------------------------------
		gameRounds[data.gameID] = 5
		gameTotalTime[data.gameID] = 10
		gameTimeLeft[data.gameID] = 10

		gameWordList[data.gameID] = fs.readFileSync("./assets/words/easy_words.txt", "utf-8").split("\n");

		gameTarget[data.gameID] = Object.keys(gameData[data.gameID])
									[Math.floor(Math.random()*(Object.keys(gameData[data.gameID]).length))];
		gameWord[data.gameID] = gameWordList[data.gameID][Math.floor(Math.random()*(gameWordList[data.gameID].length))]
		gameClue[data.gameID] = "";
		gameWord[data.gameID].split(" ").forEach(function(word) {
			gameClue[data.gameID] = gameClue[data.gameID]+"&nbsp&nbsp"+ word.replace(/./g, '_&nbsp'); 
		});

		// ------------------------------------------------------------------------------------------
		socket.emit("start timer");		
	}else{
		// prepare clue for the other peeps. For now we just go with a simple conversion to dashes
		if(socket.id == gameTarget[data.gameID]){
			console.log("setting word")
			socket.emit('set word',{word:gameWord[data.gameID]});
		}else{
			console.log("setting dashes")
			socket.emit('set word',{word:gameClue[data.gameID]});
		}
	}
});

socket.on("start timer", (data) => {
	console.log("starting timeout function")
	
	for( var i = 0; i < Object.keys(gameData[data.gameID]).length; i++ ){
		if(gameTarget[data.gameID] == Object.keys(gameData[data.gameID])[i]){
			io.to(Object.keys(gameData[data.gameID])[i]).emit('set word',{word:gameWord[data.gameID]});
		}else{
			io.to(Object.keys(gameData[data.gameID])[i]).emit('set word',{word:gameClue[data.gameID]});
		}
	}

	var downloadTimer = setInterval(function(){
		if(gameTimeLeft[data.gameID] <= 0){
			clearInterval(downloadTimer);
		}
		gameTimeLeft[data.gameID] -= 1;

		socket.emit("set timer",{timeLeft:gameTimeLeft[data.gameID]});		
		socket.to(data.gameID).emit("set timer", {timeLeft:gameTimeLeft[data.gameID]});

		if(gameRounds[data.gameID] == 0){
			socket.emit("game completed");
			socket.to(data.gameID).emit("game completed");
		}

		if(gameTimeLeft[data.gameID] == -1 && gameRounds[data.gameID] > 0){
			socket.emit("show answer", {word:gameWord[data.gameID]});
			socket.to(data.gameID).emit("show answer", {word:gameWord[data.gameID]});

			gameRounds[data.gameID] -=1
			gameTimeLeft[data.gameID] = gameTotalTime[data.gameID];
			gameTarget[data.gameID] = Object.keys(gameData[data.gameID])
										[Math.floor(Math.random()*(Object.keys(gameData[data.gameID]).length))];
			gameWord[data.gameID] = gameWordList[data.gameID][Math.floor(Math.random()*(gameWordList[data.gameID].length))]
			gameClue[data.gameID] = "";
			gameWord[data.gameID].split(" ").forEach(function(word) {
				gameClue[data.gameID] = gameClue[data.gameID]+"&nbsp&nbsp"+ word.replace(/./g, '_&nbsp'); 
			});
		}
	}, 1000);

});

socket.on("set clue", (data) => socket.to(data.gameID).emit("set clue", {word:data.clue}));

socket.on("check answer", (data) => {
	if(data.message == gameWord[data.gameID]){
		socket.emit("dont show message",data)
		score = (gameTimeLeft[data.gameID])*100/gameTotalTime[data.gameID];
		gameData[data.gameID][socket.id][0] += score
		gameData[data.gameID][socket.id][1] += 1
		socket.emit("update score",{score:gameData[data.gameID][socket.id][0],id:socket.id})
		socket.to(data.gameID).emit("update score",{score:gameData[data.gameID][socket.id][0],id:socket.id})
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
			console.log("idk")
			// socket.broadcast.emit("get chars for reloading upon disconnection");
			// socket.broadcast.emit("user left", {username: socket.username});			
		}
	});
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------



});
