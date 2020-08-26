// ------------------------------------------------------------------------------------
// --------------------------------initialize variables--------------------------------
// ------------------------------------------------------------------------------------
var socket = io();
var prev = { node: null };
var parent = document.getElementsByClassName("row")[0];
// var instruction = document.getElementById("instruction");
// instruction.innerHTML = "Choose your character";

document.getElementById("existing-game").onclick= function(e) {
  e.preventDefault()  
  update_data()
};

const cookie_val = document.cookie;
try{
  username = cookie_val.split("name=")[1].split(";")[0];
  document.getElementById("game-username").value = username
}
catch{
  console.log("No old username")
}
try{
  gamePWD = cookie_val.split("game-pwd=")[1].split(";")[0];
  document.getElementById("game-pwd").value = gamePWD
}
catch{
  console.log("No old game password")
}
try {
  gameID = cookie_val.split("gameID=")[1].split(";")[0];
  document.getElementById("game-id").value = gameID  
}
catch{
  console.log("No old game ID")
}
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

// ------------------------------------------------------------------------------------
// -------------------cascade of events based on entry for every user------------------
// ------------------------------------------------------------------------------------
// request for list of current games 
socket.emit("get ongoing games")

// the user requesting the list receives the game data
socket.on("send game data", (data) =>{
  // show ongoing games

  overlay_parent.innerHTML = overlay_parent.innerHTML +" &nbsp "+data.gameID 
});
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

// ------------------------------------------------------------------------------------
// -----------------------------------Socket Events------------------------------------
// ------------------------------------------------------------------------------------

// if password doesn't match
socket.on("password error",(data)=>{
  document.getElementById("game-pwd").style.borderColor = "red"
});

// load char page when user enters correct id and pwd
socket.on("update data",(data)=>{
  document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
  document.cookie = "name=" + data.username;
  document.cookie = "gameID=" + data.gameID;
  document.cookie = "game-pwd=" + data.gamePWD;
  username = data.username;
  gameID = data.gameID;
  gamePWD =data.gamePWD;
  document.getElementsByClassName("overlay")[0].style.display = "none";
  socket.emit("load chars", {gameID:data.gameID,gamePWD:data.gamePWD,return_id:"-"});
});

// reload chars when other user enters lobby
socket.on("reload chars",(data)=>{
  if(data.gameID == gameID && data.gamePWD == gamePWD){
    socket.emit("load chars",{gameID:data.gameID,gamePWD:data.gamePWD,return_id:socket.id})
  }
});

// socket functions for when no one is in the game
socket.on("in case no one is in lobby", (data) => {
  socket.emit("send chars", { username: "", img: "", return_id:data.return_id,chars:data.chars,imgs:data.imgs});
});
socket.on("send chars",(data)=>{
  socket.emit("update chars",data)
});

// socket function for hiding already selected characters
socket.on("hide chars globally", (data) => {
  console.log("hide chars globally")
  removePrevChars();
  var Path = "/characters/"; //Folder where we will search for files
  var i = 0;
  var blocked_list = data.imgs;
  const cookie_val = document.cookie;
  var img;
  try {
    img = cookie_val.split("img=")[1].split(";")[0];
  } catch {
    console.log("Exception(e) - Cookie not available");
  }

  for (i = 1; i < 53; i++) {
    if (
      blocked_list.includes(Path + i + ".png") ||
      img == Path + i + ".png"
    ) {
      console.log(Path + i + ".png - Avatar taken");
    } 
    else {
      var char_div = document.createElement("DIV");
      char_div.className = "characters";
      if (window.screen.width > 500) {
        char_div.style.width = "15vw";
        char_div.style.height = "15vw";
      } else {
        char_div.style.width = "30vw";
        char_div.style.height = "30vw";
      }
      char_div.style.flex = "25%";
      char_div.style.padding = "30px";
      char_div.style.position = "relative";
      parent.appendChild(char_div);

      var image = document.createElement("IMG");
      image.className = "characters_img";
      image.src = Path + i + ".png";
      if (window.screen.width > 500) {
        image.style.width = "10vw";
      } else {
        image.style.width = "20vw";
      }
      image.style.position = "absolute";
      image.style.top = "10px";
      char_div.appendChild(image);

      char_div.onmouseover = function() {
        img_hover(this);
      };

      char_div.onclick = function() {
        img_select(this);
      };
    }
  }
});
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

// ------------------------------------------------------------------------------------
// -------------when user enters data, update cookie value and show chars--------------
// ------------------------------------------------------------------------------------
function update_data() {
    var gameID = document.getElementById("game-id").value  
    var gamePWD = document.getElementById("game-pwd").value
    var username = document.getElementById("game-username").value 
    //check if the gameID and password is a match
    socket.emit("update data",{gameID:gameID,gamePWD:gamePWD,username:username,id:socket.id})
}


// ------------------------------------------------------------------------------------
// ----------scale image when mouse hovevrs on top(only for desktop versions)----------
// ------------------------------------------------------------------------------------
function img_hover(div) {
  if (prev.node === null) {
    console.log("Previous node is null");
  } else {
    var prev_child = prev.node.childNodes;
    prev_child[0].style.opacity = 1;
    prev_child[0].style.transform = "scale(1)";
  }
  var children = div.childNodes;
  children[0].style.opacity = 0.3;
  children[0].style.transform = "scale(1.25)";
  prev.node = div;
}

// ------------------------------------------------------------------------------------
// ----------------------------load lobby upon char selection--------------------------
// ------------------------------------------------------------------------------------
function img_select(div){
  var loc_arr = div.firstChild.src.split("/");
  var arr_len = loc_arr.length;
  var cookie_img = "/"+ loc_arr[arr_len-2]+"/"+loc_arr[arr_len-1]
  document.cookie = "img=" + cookie_img;
  window.location.href = "/lobby";
}

// ------------------------------------------------------------------------------------
// ------------------------clear characters before loading page------------------------
// ------------------------------------------------------------------------------------
function removePrevChars() {
  var elements = document.getElementsByClassName("characters");
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}
// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------