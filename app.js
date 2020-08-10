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

var chars = {};//for homepage
var imgs = {};//for homepage

var disp_chars = {};//for lobby
var disp_imgs = {};//for lobby
var disp_chars_copy = {};//for lobby
var disp_imgs_copy = {};//for lobby

var game_chars = [];//for game
var game_imgs = [];//for game

var curr_loc = []
var curr_games = [];

var existing_games = {}

io.on("connection", (socket) => {
// --------------------------------------------------------------------------
// ---------------------------------HOMEPAGE---------------------------------
// --------------------------------------------------------------------------
	socket.on("update existing game list", () =>{
		socket.broadcast.emit("get existing game list", {return_id:socket.id})
	});

	socket.on("get existing game list", (data) =>{
		io.to(data.return_id).emit('send existing game list', {existing_games:existing_games});
	});
	
	socket.on("send existing game list", (data) =>{
		if(Object.keys(data.existing_games).length != 0){
			existing_games = data.existing_games
			socket.broadcast.emit("update existing game list for all", {existing_games:existing_games})
		}
	});

	socket.on("update existing game list for all", (data) =>{
		if(data.existing_games){
			existing_games = data.existing_games
		}
		else{
			existing_games = data
		}
	});

	socket.on("update data", (data) => {
		if(Object.keys(existing_games).length === 0) {
			existing_games[data.gameID] = data.gamePWD
			socket.broadcast.emit("update existing game list for all", existing_games);
			socket.join(data.gameID);
			socket.emit("update data", data);
		}
		else if(data.gameID in existing_games) {
		    // remove chars selected from existing game
		    if(existing_games[data.gameID] == data.gamePWD){
				// match ! if there is a match, we allow the user to enter 
				socket.join(data.gameID);
				socket.emit("update data", data);
		    } 
		    else{
		    	// password mismatch !
				socket.emit("password error");
		    }
		}
		else{
			// update gameID
			existing_games[data.gameID] = data.gamePWD
			socket.broadcast.emit("update existing game list for all", existing_games);
			socket.join(data.gameID);
			socket.emit("update data", data);
		}
	});

	socket.on("load chars", (data) => {
		socket.join(data.gameID);
		chars[data.gameID] = [];
		imgs[data.gameID] = [];

		if(data.return_id == "-"){
			data.return_id = socket.id
		}	
		socket.broadcast.emit("get chars", {return_id:data.return_id,gameID:data.gameID,gamePWD:data.gamePWD,chars:chars[data.gameID],imgs:imgs[data.gameID]});		
		socket.emit("in case no one is in lobby", {return_id:data.return_id,gameID:data.gameID,gamePWD:data.gamePWD,chars:chars[data.gameID],imgs:imgs[data.gameID]});
	});

	socket.on("send chars", (data) => {
		io.to(data.return_id).emit('send chars', { username: data.username, img: data.img ,chars:data.chars, imgs:data.imgs});
	});

	socket.on("update chars", (data) => {
		if(chars[data.gameID] == undefined){
			chars[data.gameID] = data.chars;
			imgs[data.gameID] = data.imgs;	
		}
		if (!chars[data.gameID].includes(data.username) && !imgs[data.gameID].includes(data.img)) {
			chars[data.gameID].push(data.username);
			imgs[data.gameID].push(data.img);
		}
		socket.emit("hide chars globally", { imgs: imgs[data.gameID] });
	});

	socket.on("hide chars reloading", (data) => {
		socket.broadcast.emit("reload chars",data);		
	});

	// socket.on("reload chars for others on homepage", () => {
	// 	chars = [];
	// 	imgs = [];
	// 	socket.emit("get chars for reloading");
	// 	socket.broadcast.emit("get chars for reloading");
	// });

	// socket.on("send chars for homepage", (data) => {
	// 	if (!chars.includes(data.username) && !imgs.includes(data.img)) {
	// 		chars.push(data.username);
	// 		imgs.push(data.img);
	// 	}
	// 	socket.imgs = imgs;
	// 	socket.broadcast.emit("hide chars globally", { imgs: socket.imgs });
	// });
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// -----------------------------------LOBBY----------------------------------
// --------------------------------------------------------------------------

	socket.on("load chars on lobby", (data) => {	
		if(data.option == 'repeat'){
			if(disp_chars[data.gameID] == undefined){
				console.log("Error! Sending to homepage")
				socket.emit("send error");		
			}
			else{
				disp_chars_copy[data.gameID] = Array(disp_chars[data.gameID].length).fill(0);
				disp_imgs_copy[data.gameID] = Array(disp_imgs[data.gameID].length).fill(0);
			}
		}
		else{
			disp_chars[data.gameID] = [];
			disp_imgs[data.gameID] = [];
			socket.gameID = data.gameID
			socket.gamePWD = data.gamePWD
		}		
		socket.emit("get chars for lobby",data);
		socket.broadcast.emit("get chars for lobby",data);		
	});


	socket.on("send chars for lobby", (data) => {
		if(data.option == 'repeat'){
			try{
				// if the user is in the list disp_chars, we dont do anything
				var username_loc = disp_chars[data.gameID].indexOf(data.username);		
				var img_loc = disp_imgs[data.gameID].indexOf(data.img);
				disp_chars_copy[data.gameID][username_loc] = disp_chars[data.gameID][username_loc];
				disp_imgs_copy[data.gameID][img_loc] = disp_imgs[data.gameID][img_loc]; 
			}
			catch{
				disp_chars[data.gameID].push(data.username)
				disp_imgs[data.gameID].push(data.img)
				disp_chars_copy[data.gameID].push(data.username)
				disp_imgs_copy[data.gameID].push(data.img)
			}

	
		}
		else{
			if(disp_chars[data.gameID] == undefined){
				disp_chars[data.gameID] = []
				disp_imgs[data.gameID] = []
			}
			if (
				!disp_chars[data.gameID].includes(data.username) &&
				!disp_imgs[data.gameID].includes(data.img)
			) {
				disp_chars[data.gameID].push(data.username);
				disp_imgs[data.gameID].push(data.img);
			}
			socket.disp_chars = disp_chars[data.gameID];
			socket.disp_imgs = disp_imgs[data.gameID];

	
		}


	});
	
	socket.on("display chars on lobby", (data) => {
		if(data.option == 'repeat'){
			socket.emit("display chars lobby", {
				chars : disp_chars_copy[data.gameID],
				imgs : disp_imgs_copy[data.gameID],
				gameID : data.gameID,
				gamePWD : data.gamePWD,
				option : data.option
			});
		}
		else{
			socket.emit("display chars lobby", {
				chars: disp_chars[data.gameID],
				imgs: disp_imgs[data.gameID],
				gameID : data.gameID,
				gamePWD : data.gamePWD,
				option : data.option
			});
		}
	});

	socket.on("enter game", (data) => {
		socket.emit("enter game", data);
		socket.broadcast.emit("enter game", data);
	});

	// when the client emits 'new message', this listens and executes
	socket.on("new message", (data) => {
		socket.username = data.username;
		socket.message = data.message;
		socket.gameID = data.gameID;
		socket.gamePWD = data.gamePWD;
		// we tell the client to execute 'new message'
		socket.broadcast.emit("new message", {
			username: socket.username,
			message: socket.message,
			gameID: socket.gameID,
			gamePWD: socket.gamePWD
		});
	});

	// when the client emits 'typing', we broadcast it to others
	socket.on("typing", (data) => {
		socket.broadcast.emit("typing", data);
	});

	// when the client emits 'stop typing', we broadcast it to others
	socket.on("stop typing", (data) => {
		socket.broadcast.emit("stop typing", data);
	});

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


// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------







// --------------------------------------------------------------------------
// -----------------------------------GAME-----------------------------------
// --------------------------------------------------------------------------



/*
	var user_data = {}

	var client_dict = {};
	var current_client_dict_loc = {};
	
	var current_word_dict = {};
	var current_blanks_dict = {};
	var current_word_dict_loc = {};
	
	var total_time = 10
	var timeleft = {};
	var num_of_turns = 0


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
			console.log(socket.id)
			
			io.to(socket.id).emit('update client list contents',{gameID:data.gameID});

			// socket.emit("update client list contents",{clients:clients, gameID:data.gameID})

			socket.emit("done updating client list",{clients:clients, gameID:data.gameID})
		});	
	});

	socket.on("update client list contents", (data) => {

		socket.broadcast.to(data.gameID).emit("get existing client data list",{return_address:socket.id,uniqueID:data.uniqueID});
	
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
*/
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

// ------------------------------------------------------------------------------------
// -----------------------------------Socket Events------------------------------------
// ------------------------------------------------------------------------------------
// if user clicks ready button, all current users enter the game through this emit 
socket.on("enter game", (data) => {
  if(data.gameID == gameID &&data.gamePWD == gamePWD){
    window.location.href = "/game";
  }
});

// Whenever the server emits 'new message', update the chat body
socket.on("new message", (data) => {
  addChatMessage(data);
});

// Whenever the server emits 'typing', show the typing message
socket.on("typing", (data) => {
  addChatTyping(data);
});

// Whenever the server emits 'stop typing', kill the typing message
socket.on("stop typing", (data) => {
  removeChatTyping(data);
});

socket.on("send error", () => {
  window.location.href = "/";  
});

socket.on("disconnect", () => {
  log("you have been disconnected");  
});

socket.on("reconnect", () => {
  log("you have been reconnected");
});

socket.on("get chars for reloading", () => {
  socket.emit("send chars for homepage", {username: username, img: img });
});

socket.on("get chars for reloading upon disconnection", () => {
  socket.emit("reload chars for others not the one that left");
});

socket.on("reload chars upon disconnection", () => {
  socket.emit("reload chars for others except the one that left", {username: username, img: img});  
});

// ------------------------------------------------------------------------------------
// -----------------------------Keyboard and Click Events------------------------------
// ------------------------------------------------------------------------------------
$window.keydown((event) => {
  // When the client hits ENTER on their keyboard, update message for everyone
  if (event.which === 13) {
    sendMessage();
    socket.emit("stop typing ", {gameID:gameID,gamePWD:gamePWD});
    typing = false;
  }
});

$inputMessage.on("input", () => {
  updateTyping();
}); 

// Focus input when clicking on the message input's border
$inputMessage.click(() => {
  $inputMessage.focus();
});
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------


// ------------------------------------------------------------------------------------
// --------------------------load chars in lobby every 3 secs--------------------------
// ------------------------------------------------------------------------------------
function updateChars() {         
  setTimeout(function() {
      // refresh the lobby chars 
      socket.emit("load chars on lobby",{gameID:gameID,gamePWD:gamePWD,username: username, img: img, option:"repeat"}); 
      setTimeout(function() {
          socket.emit("display chars on lobby",{gameID:gameID,gamePWD:gamePWD, option:"repeat"});              
      }, 1000)
      updateChars()                 
  }, 2000)
}
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

// ------------------------------------------------------------------------------------
// ---------------------------removes old participant images---------------------------
// ------------------------------------------------------------------------------------
const removeParticipantsImg = (data) => {
  var parent = document.getElementById("row_chars");
  while (parent.firstChild) parent.removeChild(parent.firstChild);
};

// ------------------------------------------------------------------------------------
// ------------------------------removes old ready button------------------------------
// ------------------------------------------------------------------------------------
function removeReadyButton(){
  var parent = document.getElementById("row_ready");
  while (parent.lastElementChild) {
   parent.removeChild(parent.lastElementChild);
  } 
}

// ------------------------------------------------------------------------------------
// ----------------------------------sets ready button---------------------------------
// ------------------------------------------------------------------------------------
function setReadyButton(){  
  var parent = document.getElementById("row_ready");
  if (parent.lastElementChild){
    console.log("Button already exists")
  }
  else{    
  var btn = document.createElement("BUTTON");
  btn.innerHTML = "ready";
  btn.style.backgroundColor = "#cbe6ef";
  btn.style.height = "4vh"; 
  btn.style.marginTop= "0px";
  btn.style.marginLeft= "50px";
  btn.Id = "ready-button";
  btn.style.borderRadius = "12px";
  btn.style.width = "90%";
  btn.style.textAlign = "center";
  btn.style.verticalAlign = "middle";
  parent.appendChild(btn);
  btn.onclick = function() {
    socket.emit("enter game", {gameID:gameID,gamePWD:gamePWD});
  };
  }
}

// ------------------------------------------------------------------------------------
// ----------------------------shows all current partiipants---------------------------
// ------------------------------------------------------------------------------------
const addParticipantsImg = (data) => {
  var parent = document.getElementById("row_chars");

  var char_div = document.createElement("DIV");
  char_div.className = "characters";
  char_div.style.maxWidth = "150px";
  char_div.style.maxHeight = "150px";
  char_div.style.flex = "25%";
  char_div.style.padding = "40px";
  char_div.style.opacity = 1;
  char_div.style.transform = "scale(1)";
  parent.appendChild(char_div);

  var image = document.createElement("IMG");
  image.className = "characters_img";
  image.src = data.img;
  image.style.width = "100%";
  image.style.height = "100%";
  char_div.appendChild(image);

  var div_form = document.createElement("FORM");
  div_form.className = "characters_form";
  div_form.style.textAlign = "center";
  div_form.style.fontStyle = "italic";
  div_form.style.fontFamily = "cursive";
  char_div.appendChild(div_form);

  var div_label = document.createElement("LABEL");
  div_label.className = "characters_label";

  div_label.style.fontSize = "30px";
  div_label.innerHTML = data.char;
  div_form.appendChild(div_label);
};

// ------------------------------------------------------------------------------------
// --------------------------------sends a chat message--------------------------------
// ------------------------------------------------------------------------------------
const sendMessage = () => {
  var message = $inputMessage.val();
  // Prevent markup from being injected into the message
  message = cleanInput(message);
  if (message) {
    $inputMessage.val("");
    var dataval = { username: username, message: message , gameID: gameID, gamePWD: gamePWD};
    addChatMessage(dataval);
    socket.emit("new message", dataval);
  }
};

// ------------------------------------------------------------------------------------
// --------------------------------structures chat message--------------------------------
// ------------------------------------------------------------------------------------
// Adds the visual chat message to the message list
const addChatMessage = (data) => {
  if(data.gameID == gameID && data.gamePWD == gamePWD){
    // Don't fade the message in if there is an 'X was typing'
    var $typingMessages = getTypingMessages(data);

    if ($typingMessages.length !== 0) {
      $typingMessages.remove();
    }

    var $usernameDiv = $('<span class="username"/>')
    .text(data.username)
    .css("color", getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="messageBody">').text(data.message);

    var typingClass = data.typing ? "typing" : "";
    var $messageDiv = $('<p class="message"/>')
    .data("username", data.username)
    .addClass(typingClass)
    .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv);
    return $messageDiv
  }
};

// Gets the 'X is typing...' messages of a user
const getTypingMessages = (data) => {
  return $(".typing.message").filter(function(i) {
    return data.username;
  });
};

// Adds a message element to the messages and scrolls to the bottom
// el - The element to add as a message
// options.fade - If the element should fade-in (default = true)
// options.prepend - If the element should prepend
//   all other messages (default = false)
const addMessageElement = (el, options) => {
  var $el = $(el);
  // Setup default options
  if (!options) {
    options = {};
  }
  if (typeof options.fade === "undefined") {
    options.fade = true;
  }
  if (typeof options.prepend === "undefined") {
    options.prepend = false;
  }

  // Apply options
  if (options.fade) {
    $el.hide().fadeIn(FADE_TIME);
  }
  if (options.prepend) {
    $messages.prepend($el);
  } else {
    $messages.append($el);
  }
  $messages[0].scrollTop = $messages[0].scrollHeight;

};


// Adds the visual chat typing message
const addChatTyping = (data) => {
  if(data.gameID == gameID && data.gamePWD == gamePWD){
    data.typing = true;
    data.message = "is typing....";
    addChatMessage(data).fadeOut(function() {
      $(this).remove();
    });
  }
};

// Removes the visual chat typing message
const removeChatTyping = (data) => {
  if(data.gameID == gameID && data.gamePWD == gamePWD){
    getTypingMessages(data);
  }
};

// Updates the typing event
const updateTyping = () => {
  if (!typing) {
    typing = true;
    socket.emit("typing", { username: username ,gameID:gameID, gamePWD:gamePWD});
  }

  lastTypingTime = new Date().getTime();
  setTimeout(() => {
    var typingTimer = new Date().getTime();
    var timeDiff = typingTimer - lastTypingTime;
    if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
      socket.emit("stop typing", {gameID:gameID, gamePWD:gamePWD});
      typing = false;
    }
  }, TYPING_TIMER_LENGTH);
};

// ------------------------------------------------------------------------------------
// ----------------------------------Utility functions---------------------------------
// ------------------------------------------------------------------------------------
// Log a message
const log = (message, options) => {
  var $el = $("<p>").addClass("log").text(message);
  addMessageElement($el, options);
};

// Prevents input from having injected markup
const cleanInput = (input) => {
  return $("<div/>").text(input).html();
};

// Gets the color of a username through our hash function
const getUsernameColor = (username) => {
  // Compute hash code
  var hash = 7;
  for (var i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + (hash << 5) - hash;
  }
  // Calculate color
  var index = Math.abs(hash % COLORS.length);
  return COLORS[index];
};
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------





});
