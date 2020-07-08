const express = require("express");
const path = require("path");
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

var chars = [];//for homepage
var imgs = [];//for homepage
var disp_chars = [];//for lobby
var disp_imgs = [];//for lobby
var game_chars = [];//for game
var game_imgs = [];//for game

var curr_loc = []
var curr_games = [];

io.on("connection", (socket) => {
// --------------------------------------------------------------------------
// ---------------------------------HOMEPAGE---------------------------------
// --------------------------------------------------------------------------
	var addedUser = false;
	socket.on("load chars", () => {
		chars = [];
		imgs = [];
		socket.broadcast.emit("get chars");
		socket.emit("in case no one is in lobby");
	});

	socket.on("send chars", (data) => {
		if (data.username == "" && data.img == "") {
			// nothing happens
		} else if (!chars.includes(data.username) && !imgs.includes(data.img)) {
			chars.push(data.username);
			imgs.push(data.img);
		}
		socket.imgs = imgs;
		socket.emit("hide chars globally", { imgs: socket.imgs });
	});

	socket.on("reload chars for others on homepage", () => {
		chars = [];
		imgs = [];
		socket.emit("get chars for reloading");
		socket.broadcast.emit("get chars for reloading");
	});

	socket.on("send chars for homepage", (data) => {
		if (!chars.includes(data.username) && !imgs.includes(data.img)) {
			chars.push(data.username);
			imgs.push(data.img);
		}
		socket.imgs = imgs;
		socket.broadcast.emit("hide chars globally", { imgs: socket.imgs });
	});
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// -----------------------------------LOBBY----------------------------------
// --------------------------------------------------------------------------
	socket.on("reload chars for others not the one that left", () => {
		disp_chars = [];
		disp_imgs = [];
		socket.emit("reload chars upon disconnection");
	});

	socket.on("reload chars for others except the one that left", (data) => {
		if (!disp_chars.includes(data.username) && !disp_imgs.includes(data.img)) {
			disp_chars.push(data.username);
			disp_imgs.push(data.img);
		}
		socket.disp_chars = disp_chars;
		socket.disp_imgs = disp_imgs;

		socket.emit("display chars lobby", {
			chars: socket.disp_chars,
			imgs: socket.disp_imgs,
		});
		socket.broadcast.emit("display chars lobby", {
			chars: socket.disp_chars,
			imgs: socket.disp_imgs,
		});
	});

	socket.on("load chars on lobby", () => {		
		disp_chars = [];
		disp_imgs = [];
		socket.emit("get chars for lobby");
		socket.broadcast.emit("get chars for lobby");		
	});


	socket.on("send chars for lobby", (data) => {
		if (
			!disp_chars.includes(data.username) &&
			!disp_imgs.includes(data.img)
		) {
			disp_chars.push(data.username);
			disp_imgs.push(data.img);
		}
		socket.disp_chars = disp_chars;
		socket.disp_imgs = disp_imgs;

		socket.emit("display chars lobby", {
			chars: socket.disp_chars,
			imgs: socket.disp_imgs,
		});
		socket.broadcast.emit("display chars lobby", {
			chars: socket.disp_chars,
			imgs: socket.disp_imgs,
		});
	});

	socket.on("remove old buttons",()=>{
		socket.broadcast.emit("remove old buttons");
	});

	socket.on("enter game", (data) => {
		socket.emit("enter game", {gameID:data.gameID});
		socket.broadcast.emit("enter game", {gameID:data.gameID});
	});

	// when the client emits 'new message', this listens and executes
	socket.on("new message", (data) => {
		socket.username = data.username;
		socket.message = data.message;
		// we tell the client to execute 'new message'
		socket.broadcast.emit("new message", {
			username: socket.username,
			message: socket.message,
		});
	});

	// when the client emits 'add user', this listens and executes
	socket.on("add user", (data) => {
		if (addedUser) return;
		// we store the username in the socket session for this client
		socket.username = data.username;
		socket.message = data.message;
		addedUser = true;

		// echo globally (all clients) that a person has connected
		socket.broadcast.emit("user joined", {
			username: socket.username,
			message: socket.message,
		});
	});

	// when the client emits 'typing', we broadcast it to others
	socket.on("typing", (data) => {
		socket.broadcast.emit("typing", {
			username: data.username,
		});
	});

	// when the client emits 'stop typing', we broadcast it to others
	socket.on("stop typing", () => {
		socket.broadcast.emit("stop typing", {
			username: socket.username,
		});
	});
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------







// --------------------------------------------------------------------------
// -----------------------------------GAME-----------------------------------
// --------------------------------------------------------------------------
	var my_client_dict = {};
	var current_client_dict = {};
	var current_client_dict_loc = {};
	var options = ["pineapple book", "vampire book", "book vampire", "cook bottles"]
	var word = options[Math.floor(Math.random()*options.length)];
	

	function timer(gameID){
		var timeleft = 60;
		var inner_loop_done = false;

		var downloadTimer = setInterval(function(){
			if(timeleft <= 0){
				clearInterval(downloadTimer);
			}
			socket.emit("update timer",{timeleft : timeleft});
			socket.broadcast.to(gameID).emit("update timer",{timeleft : timeleft});
			timeleft -= 1;
		console.log("done1")
		inner_loop_done = true
		}, 1000);
		if(inner_loop_done == true){
			console.log("done2")
		}else{
			console.log("done3")
		}
	}

	socket.on("update client list", (data) => {
		io.of('/').in(data.gameID).clients((error, clients) => {
			my_client_dict[data.gameID] = clients
			current_client_dict_loc[data.gameID] = 0
			current_client_dict[data.gameID] = my_client_dict[data.gameID][current_client_dict_loc[data.gameID]];
		});
	});

	socket.on("start game", (data) => {
		if(!curr_games.includes(data.gameID)){
			var curr_player = my_client_dict[data.gameID][current_client_dict_loc[data.gameID]]
			io.to(curr_player).emit('show word',{word:word, gameID:data.gameID, curr_player:curr_player, clients:my_client_dict[data.gameID], curr_loc:current_client_dict_loc[data.gameID]});
			timer(data.gameID)
		}else{
			console.log("other players joinined")
		}
	});

	socket.on("show data to other players", (data) => {
		my_client_dict[data.gameID].forEach(function(client){
			if(data.curr_player!=client){
				io.to(client).emit('show data',data);
			}
		});
	});

	// when the client emits 'new message', this listens and executes
	socket.on("new message in game", (data) => {
		socket.username = data.username;
		socket.message = data.message;
		socket.gameID = data.gameID;
		// we tell the client to execute 'new message'
		socket.broadcast.emit("new message in game", {
			username: socket.username,
			message: socket.message,
			gameID: socket.gameID
		});
	});
	// when the client emits 'add user', this listens and executes
	socket.on("add user in game", (data) => {
		if (addedUser) return;
		// we store the username in the socket session for this client
		socket.username = data.username;
		socket.message = data.message;
		socket.gameID = data.gameID;
		addedUser = true;

		// echo globally (all clients) that a person has connected
		socket.broadcast.emit("user joined in game", {
			username: socket.username,
			message: socket.message,
			gameID: socket.gameID
		});
	});
	// when the client emits 'typing', we broadcast it to others
	socket.on("typing in game", (data) => {
		socket.broadcast.emit("typing in game", {
			username: data.username,
			gameID: data.gameID
		});
	});
	// when the client emits 'stop typing', we broadcast it to others
	socket.on("stop typing in game", () => {
		socket.broadcast.emit("stop typing in game", {
			username: socket.username,
			gameID: socket.gameID
		});
	});

	socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));

	socket.on("reload chars for others not the one that left in game", () => {
		game_chars = [];
		game_imgs = [];
		socket.emit("reload chars upon disconnection in game");
	});

	socket.on("reload chars for others except the one that left in game", (data) => {
		if (!game_chars.includes(data.username) && !game_imgs.includes(data.img)) {
			game_chars.push(data.username);
			game_imgs.push(data.img);
		}
		socket.game_chars = game_chars;
		socket.game_imgs = game_imgs;
		socket.join(data.gameID);
		

		socket.emit("display chars in game", {
			chars: socket.game_chars,
			imgs: socket.game_imgs,
			gameID: data.gameID
		});
		socket.broadcast.emit("display chars in game", {
			chars: socket.game_chars,
			imgs: socket.game_imgs,
			gameID: data.gameID
		});
	});

	socket.on("load chars in game", (data) => {		
		game_chars = [];
		game_imgs = [];
		socket.emit("get chars for game",data);
		socket.broadcast.emit("get chars for game",data);
	});


	socket.on("send chars for game", (data) => {
		if (
			!game_chars.includes(data.username) &&
			!game_imgs.includes(data.img)
		) {
			game_chars.push(data.username);
			game_imgs.push(data.img);
		}
		socket.game_chars = game_chars;
		socket.game_imgs = game_imgs;
		socket.join(data.gameID);
		
		socket.emit("display chars in game", {
			chars: socket.game_chars,
			imgs: socket.game_imgs,
			gameID: data.gameID
		});
		socket.broadcast.emit("display chars in game", {
			chars: socket.game_chars,
			imgs: socket.game_imgs,
			gameID: data.gameID
		});
	});
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------


// --------------------------------------------------------------------------
// -------------------------------DISCONNECTION------------------------------
// --------------------------------------------------------------------------
	// when the user disconnects.. perform this
	socket.on("disconnect", () => {
		if (!socket.gameID){
			socket.broadcast.emit("get chars for reloading upon disconnection");
			socket.broadcast.emit("user left", {
				username: socket.username,
			});			
		}else{
			socket.broadcast.emit("user left game", {
				username: socket.username,
				gameID: socket.gameID
			});

		}
		
	});
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------




});
