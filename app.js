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

io.on("connection", (socket) => {
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

	socket.on("remove char from lobby",(data)=>{
		console.log("removing chars from lobby!")
		console.log(disp_chars)
		
	});

	socket.on("enter game", (data) => {
		console.log("connected :"+socket.id);
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

	// when the user disconnects.. perform this
	socket.on("disconnect", () => {
		socket.broadcast.emit("get chars for reloading upon disconnection");

		socket.broadcast.emit("user left", {
			username: socket.username,
		});
		
	});













	// when the client emits 'new message', this listens and executes
	socket.on("new message in game", (data) => {
		socket.username = data.username;
		socket.message = data.message;
		// we tell the client to execute 'new message'
		socket.broadcast.emit("new message in game", {
			username: socket.username,
			message: socket.message,
		});
	});
	// when the client emits 'add user', this listens and executes
	socket.on("add user in game", (data) => {
		if (addedUser) return;
		// we store the username in the socket session for this client
		socket.username = data.username;
		socket.message = data.message;
		addedUser = true;

		// echo globally (all clients) that a person has connected
		socket.broadcast.emit("user joined in game", {
			username: socket.username,
			message: socket.message,
		});
	});
	// when the client emits 'typing', we broadcast it to others
	socket.on("typing in game", (data) => {
		socket.broadcast.emit("typing in game", {
			username: data.username,
		});
	});
	// when the client emits 'stop typing', we broadcast it to others
	socket.on("stop typing in game", () => {
		socket.broadcast.emit("stop typing in game", {
			username: socket.username,
		});
	});
	// when the user disconnects.. perform this
	socket.on("disconnect in game", () => {
		socket.broadcast.emit("user left in game", {
			username: socket.username,
		});
		
	});





	socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
});
