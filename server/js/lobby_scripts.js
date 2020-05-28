if (!document.cookie) {
  window.location.href = "/";
}

var FADE_TIME = 150; // ms
var TYPING_TIMER_LENGTH = 400; // ms
var COLORS = [
  "#008b8b",
  "#006060",
  "#1b7742",
  "#002627",
  "#3477db",
  "#870c25",
  "#d50000",
  "#d24d57",
  "#aa2e00",
  "#d35400",
  "#aa6b51",
  "#554800",
  "#1c2833",
  "#34515e",
  "#4b6a88",
  "#220b38",
  "#522032",
  "#7d314c",
  "#483d8b",
  "#77448b",
  "#8a2be2",
  "#a74165",
  "#9b59b6",
  "#db0a5b",
];

// Initialize variables
var $window = $(window);
var $messages = $(".messages"); // Messages area
var $inputMessage = $(".inputMessage"); // Input message input box
var $chatPage = $(".chat.page"); // The chatroom page
var typing = false;
var lastTypingTime;
var username;
var img;

const cookie_val = document.cookie;
username = cookie_val.split("name=")[1].split(";")[0];
img = cookie_val.split("img=")[1].split(";")[0];


function start_game(e){
  socket.emit("enter game")
}


var socket = io();
socket.emit("reload chars for others on homepage");
socket.emit("load chars on lobby");


socket.on("enter game", () => {
  window.location.href = "/game";
});

socket.on("display chars lobby", (data) => {
  removeParticipantsImg();
  var i;
  for (i = 0; i < data.chars.length; i++) {
    addParticipantsImg({ char: data.chars[i], img: data.imgs[i] });
  }
});


socket.on("delete ready button", () => {
try{
  btn = document.getElementById("ready-button")
  btn.remove();
}
catch{
console.log("Exception(e) - Ready button not present")
}
socket.emit("lol")
});

socket.on("set ready button", () => {
var parent = document.getElementById("row_ready");
var btn = document.createElement("BUTTON");
console.log("Leader!")
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
  start_game(this);
};
});


// Sets the client's username
const setUsername = () => {
  // If the username is valid
  username = cookie_val.split("name=")[1].split(";")[0];
  img = cookie_val.split("img=")[1];
  // Tell the server your username
  var message = $inputMessage.val();
  // Prevent markup from being injected into the message
  message = cleanInput(message);
  var data = { username: username, message: message };
  socket.emit("add user", data);
};

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
  // div_label.style.width = "100%";
  div_label.innerHTML = data.char;
  div_form.appendChild(div_label);
};

const removeParticipantsImg = (data) => {
  var parent = document.getElementById("row_chars");
  while (parent.firstChild) parent.removeChild(parent.firstChild);
};

// Sends a chat message
const sendMessage = () => {
  var message = $inputMessage.val();
  // Prevent markup from being injected into the message
  message = cleanInput(message);
  if (message) {
    $inputMessage.val("");
    var dataval = { username: username, message: message };
    addChatMessage(dataval);
    socket.emit("new message", dataval);
  }
};

// Log a message
const log = (message, options) => {
  var $el = $("<p>")
    .addClass("log")
    .text(message);
  addMessageElement($el, options);
};

// Adds the visual chat message to the message list
const addChatMessage = (data, options) => {
  // Don't fade the message in if there is an 'X was typing'
  var $typingMessages = getTypingMessages(data);
  options = options || {};

  if ($typingMessages.length !== 0) {
    options.fade = false;
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

  addMessageElement($messageDiv, options);
};

// Adds the visual chat typing message
const addChatTyping = (data) => {
  data.typing = true;
  data.message = "is typing....";
  addChatMessage(data);
};

// Removes the visual chat typing message
const removeChatTyping = (data) => {
  getTypingMessages(data).fadeOut(function() {
    $(this).remove();
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

// Prevents input from having injected markup
const cleanInput = (input) => {
  return $("<div/>")
    .text(input)
    .html();
};

// Updates the typing event
const updateTyping = () => {
  if (!typing) {
    typing = true;
    username = cookie_val.split("name=")[1].split(";")[0];
    socket.emit("typing", { username: username });
  }

  lastTypingTime = new Date().getTime();
  setTimeout(() => {
    var typingTimer = new Date().getTime();
    var timeDiff = typingTimer - lastTypingTime;
    if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
      socket.emit("stop typing");
      typing = false;
    }
  }, TYPING_TIMER_LENGTH);
};

// Gets the 'X is typing' messages of a user
const getTypingMessages = (data) => {
  return $(".typing.message").filter(function(i) {
    return data.username;
  });
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

// Keyboard events

$window.keydown((event) => {
  // When the client hits ENTER on their keyboard
  if (event.which === 13) {
    if (username) {
      sendMessage();
      socket.emit("stop typing");
      typing = false;
    } else {
      setUsername();
      sendMessage();
    }
  }
});

$inputMessage.on("input", () => {
  updateTyping();
});

// Click events

// Focus input when clicking on the message input's border
$inputMessage.click(() => {
  $inputMessage.focus();
});

// Socket events

//when new user on front page requests for the characters to be loaded
socket.on("get chars", () => {
  socket.emit("send chars", { username: username, img: img });
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

socket.on("get chars for lobby", () => {
  socket.emit("send chars for lobby", { username: username, img: img });
});

// Whenever the server emits 'new message', update the chat body
socket.on("new message", (data) => {
  addChatMessage(data);
});

// Whenever the server emits 'user joined', log it in the chat body
socket.on("user joined", (data) => {
  addChatMessage(data);
});

// Whenever the server emits 'user left', log it in the chat body
socket.on("user left", (data) => {
  removeChatTyping(data);
});

// Whenever the server emits 'typing', show the typing message
socket.on("typing", (data) => {
  addChatTyping(data);
});

// Whenever the server emits 'stop typing', kill the typing message
socket.on("stop typing", (data) => {
  removeChatTyping(data);
});

socket.on("disconnect", () => {
  log("you have been disconnected");
});

socket.on("reconnect", () => {
  log("you have been reconnected");
  if (username) {
    socket.emit("add user", username);
  }
});

socket.on("reconnect_error", () => {
  log("attempt to reconnect has failed");
});
