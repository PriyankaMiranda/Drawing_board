if (!document.cookie) {
  window.location.href = "/";
}
// ------------------------------------------------------------------------------------
// --------------------------------initialize variables--------------------------------
// ------------------------------------------------------------------------------------
var socket = io();
var FADE_TIME = 150; // ms
var TYPING_TIMER_LENGTH = 10; // ms
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

var $window = $(window);
var $messages = $(".messages"); // Messages area
var $inputMessage = $(".inputMessage"); // Input message input box
var $chatPage = $(".chat.page"); // The chatroom page
var typing = false;
var lastTypingTime;
var username;
var img;
var gameID;

const cookie_val = document.cookie;

try{
  username = cookie_val.split("name=")[1].split(";")[0];
  img = cookie_val.split("img=")[1].split(";")[0];
  gameID = cookie_val.split("gameID=")[1].split(";")[0];
  gamePWD = cookie_val.split("game-pwd=")[1].split(";")[0];
}
catch{
  window.location.href = "/";
}

document.getElementById("gameID").innerHTML += gameID;
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

// ------------------------------------------------------------------------------------
// -------------------cascade of events based on entry for every user------------------
// ------------------------------------------------------------------------------------
// load chars in lobby
socket.emit("load chars on lobby",{gameID:gameID,gamePWD:gamePWD});   
// updateChars() 
// hide currently used chars for other users in homepage 
socket.emit("hide chars reloading",{gameID:gameID,gamePWD:gamePWD});
// get chars from all users present in lobby to hide in homempage
socket.on("get chars", (data) => {
  if(gameID == data.gameID && gamePWD == data.gamePWD){
    socket.emit("send chars", { username: username, img: img , return_id: data.return_id,chars:data.chars,imgs:data.imgs});
  }
});

// get chars from all users present in lobby
socket.on("get chars for lobby", (data) => {
  if(data.gameID == gameID && data.gamePWD == gamePWD){
    socket.emit("send chars for lobby", { username: username, img: img,gameID:gameID,gamePWD:gamePWD});
  }
});
// display all the details of the users present in lobby
socket.on("display chars lobby", (data) => {
  if(data.gameID == gameID && data.gamePWD == gamePWD){
    removeParticipantsImg();
    removeReadyButton();
    if (username == data.chars[0] && img == data.imgs[0]){
      //first user gets the ready button!
      setReadyButton()
      // socket.emit("load chars on lobby",{gameID:gameID,gamePWD:gamePWD});
      updateChars()   
    }
    for (var i = 0; i < data.chars.length; i++) {
      addParticipantsImg({char: data.chars[i], img: data.imgs[i]});
    }
  }
});
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

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

// Whenever the server emits 'user joined', log it in the chat body
// socket.on("user joined", (data) => {
//   addChatMessage(data);
// });

// Whenever the server emits 'user left', log it in the chat body
// socket.on("user left", (data) => {
//   removeChatTyping(data);
// });

socket.on("disconnect", () => {
  console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww")
  log("you have been disconnected");  
});

socket.on("reconnect", () => {
  console.log("oooooooooooooooooooooooooooooo")
  console.log("oooooooooooooooooooooooooooooo") 
  console.log("oooooooooooooooooooooooooooooo")
  console.log("oooooooooooooooooooooooooooooo")
  log("you have been reconnected");
  if (username) {
    socket.emit("add user", username);
  }
});

socket.on("reconnect_error", () => {
  log("attempt to reconnect has failed");
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
      socket.emit("load chars on lobby",{gameID:gameID,gamePWD:gamePWD});                  
  }, 3000)
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
