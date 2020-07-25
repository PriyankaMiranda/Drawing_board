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
	var user_data = {}

	var client_dict = {};
	var current_client_dict_loc = {};
	
	var current_word_dict = {};
	var current_blanks_dict = {};
	var current_word_dict_loc = {};
	
	var total_time = 10
	var timeleft = {};
	var num_of_turns = 1


	var last_curr_word = '';

	//this includes, the unique id for the client, the number of turns it has completed and other info if needed
	var client_data = {};

	var my_data_current = {};

	var id_match = {};

	socket.on("update my data for everyone", (data) => {
		current_word_dict[data.gameID] = data.word_list	
		current_blanks_dict[data.gameID] = data.blanks_list
		current_word_dict_loc[data.gameID] = data.curr_word_loc
		client_dict[data.gameID] = data.clients
		current_client_dict_loc[data.gameID] = data.curr_client_loc
		client_data[data.gameID] = data.client_data
		timeleft[data.gameID] = data.timeleft

		my_data_current = {
			word_list : current_word_dict[data.gameID], 
			blanks_list : current_blanks_dict[data.gameID],
			curr_word_loc : current_word_dict_loc[data.gameID],
			
			clients : client_dict[data.gameID], 
			curr_client_loc : current_client_dict_loc[data.gameID],

			client_data : client_data[data.gameID],
			gameID : data.gameID,
			timeleft : timeleft[data.gameID]
		}
		socket.emit("operations", {my_data_current:my_data_current})
	});

	socket.on("operations", (data) => {
		socket.emit("match score with username and img",{id : socket.id});
		socket.broadcast.to(data.gameID).emit("get score with username and img",{return_id : socket.id});

		socket.emit("update timer",{timeleft:data.timeleft});
		var data_to_send;	
		data_to_send = {word : data.blanks_list[data.curr_word_loc]}
		if(socket.id == data.clients[data.curr_client_loc]){
			data_to_send = {word : data.word_list[data.curr_word_loc]}
		}
		socket.emit('show word data', data_to_send);
	});

	socket.on("sending score", (data) => {
		id_match[data.id] = {username:data.username,img:data.img} 
	});

	socket.on("sending score 2", (data) => {
		io.to(data.return_id).emit('match score with username and img 2',data);
	});



	socket.on("check answer", (data) => {
		if(data.message != last_curr_word && data.message == my_data_current.word_list[my_data_current.curr_word_loc]){
			last_curr_word = data.message
			points = (data.time_val)*100/total_time;
			my_data_current.client_data.forEach(function(client) {
				if(client[0] == socket.id){
					client[3] = client[3] + points
				}
				else if(client[0] == my_data_current.clients[my_data_current.curr_client_loc]){
					client[3] = client[3] + parseInt(points/my_data_current.clients.length) 	
				}
			});
			socket.emit("update my data for everyone",{my_data_current:my_data_current});
			socket.broadcast.to(data.gameID).emit("update my data for everyone",{my_data_current:my_data_current});
		}
	});
		

	function game_complete(data){
		console.log("game_complete")
		// show scoreboard - will have to match scores to the users 
		socket.emit("leader board",data.client_data);
		socket.broadcast.to(data.gameID).emit("leader board",data.client_data);
	}

	function update_timer_and_data(data){
		console.log("timer started")
		timeleft[data.gameID] = total_time
		var downloadTimer = setInterval(function(){
			if(timeleft[data.gameID] <= 0){
				clearInterval(downloadTimer);
			}

			my_data_current = {
				word_list : current_word_dict[data.gameID], 
				blanks_list : current_blanks_dict[data.gameID],
				curr_word_loc : current_word_dict_loc[data.gameID],
				
				clients : client_dict[data.gameID], 
				curr_client_loc : current_client_dict_loc[data.gameID],

				client_data : client_data[data.gameID],
				gameID : data.gameID,
				timeleft : timeleft[data.gameID]
			}
			
			if(Object.keys(id_match).length != 0){				
				Object.keys(id_match).forEach(function(key) {
					my_data_current.client_data.forEach(function(client) {
						if(key == client[0]){
							client[4] = id_match[key].username
							client[5] = id_match[key].img
						}
					});
				});
			}

			socket.emit("operations", {my_data_current:my_data_current})
			socket.broadcast.to(data.gameID).emit("update my data for everyone",{my_data_current:my_data_current});		

			timeleft[data.gameID] -= 1;

			if(timeleft[data.gameID] == -1){
				// updating user turn and the score for the person who drew
				my_data_current.client_data.forEach(function(client) {
					if(client[0] == my_data_current.clients[my_data_current.curr_client_loc]){
						client[2] = client[2] + 1
						client[3] = client[3] + parseInt(100/my_data_current.clients.length)
					}
				});
				console.log(my_data_current)

				// finding the next player
				var min = 1000;
				var next_player=-1;
				for(var x = 0; x < my_data_current.client_data.length; x++){
					if(my_data_current.client_data[x][2] < min){
						min = my_data_current.client_data[x][2]
						next_player = next_player +1
					}
				}

				// show the correct answer for 2s
				socket.emit("show correct answer",{ans:my_data_current.word_list[my_data_current.curr_word_loc]});		
				socket.broadcast.to(data.gameID).emit("show correct answer",{ans:my_data_current.word_list[my_data_current.curr_word_loc]});
				
				if(min!=num_of_turns){
					// update for next round
					my_data_current.curr_client_loc = next_player
					my_data_current.curr_word_loc = (my_data_current.curr_word_loc + 1)%(my_data_current.word_list.length)
					my_data_current.timeleft = total_time
					socket.emit("update my data for everyone",{my_data_current:my_data_current});		
					socket.broadcast.to(data.gameID).emit("update my data for everyone",{my_data_current:my_data_current});
					// next round
					setTimeout(function(){ update_timer_and_data({gameID:data.gameID}); }, 1000);
				}
				else{
					game_complete(my_data_current)
				}
			}
		
		}, 1000);

	}

	socket.on("save client list", (data) => {
		if(!curr_games.includes(data.gameID)){
			var my_client_data = []
			console.log(user_data)
			data.clients.forEach(function(client) {
				//socket-id, unique-id, turn, score, username, image 
				my_client_data.push([client,Math.random().toString(36).substring(7),0, 0,"",""])
			});
			client_data[data.gameID] = my_client_data;
			socket.emit("set my client data list", {client_data:client_data[data.gameID]});
			socket.broadcast.to(data.gameID).emit("set my client data list", {client_data:client_data[data.gameID]});
			curr_games.push(data.gameID)

			//---------------------------need to change this later----------------------------
			var chosen_options_qn = ["cookie","vampire", "bubble gum", "space bar", "toothbrush", "toenail"]
			var chosen_options_ans = []
			chosen_options_qn.forEach(function(option) {
				var words = option.split(" ");
				var dashes;
				var final_dashes = "";
				words.forEach(function(word) {
					dashes = word.replace(/./g, '_&nbsp');
					final_dashes = final_dashes+"&nbsp&nbsp"+ dashes  
				});
				chosen_options_ans.push(final_dashes)
			});
			//--------------------------------------------------------------------------------
			// intitialization of location
			current_client_dict_loc[data.gameID] = 0
			current_word_dict_loc[data.gameID] = 0
			current_word_dict[data.gameID] = chosen_options_qn;
			current_blanks_dict[data.gameID] = chosen_options_ans;
			update_timer_and_data(data)
		}else{
			// get old client data for new user entering 
			my_uniqueID = Math.random().toString(36).substring(7)
			socket.broadcast.to(data.gameID).emit("get existing client data list",{return_address:socket.id,uniqueID:my_uniqueID});
		}
	});

	socket.on("check if update is required", (data) => {
		data.client_data.forEach(function(client) {
			if(socket.id == client[0]){
				socket.emit("send unique id",{id:client[1]});
			}
		});
	});

    socket.on("return client data list", (data) => {
    	if(data.client_data.length>0){
	    	var updated_client_list = []
	    	console.log("returning client data list")
	    		var id_found = false
		    	for(var x=0; x<data.client_data.length; x++){
					if(data.uniqueID == data.client_data[x][1]){
						//update socket id 
						updated_client_list[x] = [0,0,0,0,'','']
						updated_client_list[x][0] = data.id
			    		updated_client_list[x][1] = data.client_data[x][1]
			    		updated_client_list[x][2] = data.client_data[x][2]
			    		updated_client_list[x][3] = data.client_data[x][3]
			    		id_found=true
					}else{
			    		updated_client_list[x] = data.client_data[x]
					}
				}
				if(id_found){
					client_data[data.gameID] = updated_client_list
					socket.emit("update client data list",{client_dict:client_data[data.gameID]});
					socket.broadcast.to(data.gameID).emit("update client data list",{client_dict:client_data[data.gameID]});
				}else{
		    		updated_client_list = data.client_data 
		    		updated_client_list.push([socket.id,data.uniqueID,0, 0])
		    		client_data[data.gameID] = updated_client_list
					socket.emit("set my client data list", {client_data:client_data[data.gameID]});
					socket.broadcast.to(data.gameID).emit("set my client data list", {client_data:client_data[data.gameID]});				
				}
	    	
    	}
	});

	socket.on("update client list - old user", (data) => {
		console.log("old user")
		socket.broadcast.to(data.gameID).emit("get existing client data list",{return_address:socket.id,uniqueID:data.uniqueID});
	});

	// when a new user enters, we just get all the clients data and update the client list for the person
	socket.on("update client list - new user", (data) => {
		console.log("new user")
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
