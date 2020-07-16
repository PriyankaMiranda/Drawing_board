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
	var client_dict = {};
	var current_client_dict_loc = {};
	
	var current_word_dict = {};
	var current_word_dict_loc = {};
	
	var timeleft = {};

	//this includes, the unique id for the client, the number of turns it has completed and other info if needed
	var client_data = {};


    socket.on("check", (data) => {
		console.log("Basic check function!")
		console.log(data)
	});

	function update_timer_and_data(data){
		timeleft[data.gameID] = 60;
		var downloadTimer = setInterval(function(){
			if(timeleft <= 0){
				clearInterval(downloadTimer);
			}
			var my_data = {
				word_list : current_word_dict[data.gameID], 
				curr_word_loc : current_word_dict_loc[data.gameID],
				curr_word : current_word_dict[data.gameID][current_word_dict_loc[data.gameID]],
				clients : client_dict[data.gameID], 
				curr_client_loc : current_client_dict_loc[data.gameID],
				curr_player : client_dict[data.gameID][current_client_dict_loc[data.gameID]], 
				gameID : data.gameID,
				timeleft : timeleft[data.gameID]
			}
			console.log(my_data)
			socket.emit("update timer and data",my_data);
			socket.broadcast.to(data.gameID).emit("update timer and data",my_data);			
			io.to(my_data.curr_player).emit('show data to person drawing', my_data);
			timeleft[data.gameID] -= 1;

			if(timeleft[data.gameID] == -1){
				user_num_turns[data.gameID][my_data.curr_player] += 1
				console.log("Done")
				console.log(my_data)
				current_client_dict_loc[data.gameID] = (current_client_dict_loc[data.gameID] + 1)%(client_dict[data.gameID].length)
				current_word_dict_loc[data.gameID] = (current_word_dict_loc[data.gameID] + 1)%(current_word_dict[data.gameID].length)
				console.log(my_data)
			}
		
		}, 1000);

	}

	socket.on("save client list", (data) => {
		if(!curr_games.includes(data.gameID)){
			var my_clients = []
			data.clients.forEach(function(client) {
				my_clients.push([client,Math.random().toString(36).substring(7),0, 0])
			});
			client_dict[data.gameID] = my_clients;

			socket.emit("set my client data list", {client_dict:client_dict[data.gameID]});
			socket.broadcast.to(data.gameID).emit("set my client data list", {client_dict:client_dict[data.gameID]});

			curr_games.push(data.gameID)
			//---------------------------need to change this later----------------------------
			var chosen_options = ["eating banana", "tailbone", "vampire", "cookie"]
			//--------------------------------------------------------------------------------
			// intitialization of location
			current_client_dict_loc[data.gameID] = 0
			current_word_dict_loc[data.gameID] = 0
			current_word_dict[data.gameID] = chosen_options;
			// update_timer_and_data(data)
		}
	});

	socket.on("check if update is required", (data) => {
		data.client_dict.forEach(function(client) {
			if(socket.id == client[0]){
				socket.emit("send unique id",{id:client[1]});
			}
		});
	});

    socket.on("return client data list", (data) => {
    	if(data.client_dict.length>0){
	    	var updated_client_list = []
	    	for(var x=0; x<data.client_dict.length; x++){
				if(data.uniqueID == data.client_dict[x][1]){
					//update socket id 
					updated_client_list[x] = [0,0,0,0]
					updated_client_list[x][0] = data.id
		    		updated_client_list[x][1] = data.client_dict[x][1]
		    		updated_client_list[x][2] = data.client_dict[x][2]
		    		updated_client_list[x][3] = data.client_dict[x][3]
				}else{
		    		updated_client_list[x] = data.client_dict[x]
				}
			}
			socket.emit("update client data list",{client_dict:updated_client_list});
			socket.broadcast.to(data.gameID).emit("update client data list",{client_dict:updated_client_list});
    	}
	});

	socket.on("update client list - old user", (data) => {
		console.log("old user")
		socket.broadcast.to(data.gameID).emit("get existing client data list",{return_address:socket.id,uniqueID:data.uniqueID});
	});

	socket.on("update client list - new user", (data) => {
		console.log("new user")
		client_data[data.gameID] = []
		io.clients((error, clients) => {
			if (error) throw error;
			client_dict[data.gameID] = clients	
			socket.emit("done updating client list",{clients:clients, gameID:data.gameID})
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
		if (!game_chars.includes(data.username) || !game_imgs.includes(data.img)) {
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
		if (!game_chars.includes(data.username) || !game_imgs.includes(data.img)) 
		{
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
