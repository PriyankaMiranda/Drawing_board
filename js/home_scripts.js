// ------------------------------------------------------------------------------------
// --------------------------------initialize variables--------------------------------
// ------------------------------------------------------------------------------------
var socket = io();
var prev = { node: null }; // to track the character selected before
var current_ids = []
var entered_char_page = false
const cookie_val = document.cookie;

try{
  document.getElementById("game-username").value = cookie_val.split("name=")[1].split(";")[0];
}
catch{
  console.log("No old username")
}
try{
  document.getElementById("game-pwd").value = cookie_val.split("game-pwd=")[1].split(";")[0];
}
catch{
  console.log("No old game password")
}
try {
  document.getElementById("game-id").value = cookie_val.split("gameID=")[1].split(";")[0];
}
catch{
  console.log("No old game ID")
}

// ------------------------------------------------------------------------------------
// -------------------cascade of events based on entry for every user------------------
// ------------------------------------------------------------------------------------

// request for list of current games 
socket.emit("get ongoing games")

// the user requesting the list receives the game data
socket.on("send game data", (data) =>{
  if(!current_ids.includes(data.gameID)){
    current_ids.push(data.gameID)
  }
});

// ------------------------------------------------------------------------------------
// -----------------------------------Socket Events------------------------------------
// ------------------------------------------------------------------------------------

// socket function for when there no match in the gameID and gamePWD
socket.on("issue",()=>{
  document.getElementById("game-id").style.borderColor = "red"
  document.getElementById("game-id").style.borderRadius = "5px"
  document.getElementById('game-id').value = '';
  document.getElementById('game-id').placeholder = 'Game ID already in use!';
  document.getElementById("game-pwd").style.borderColor = "red"
  document.getElementById("game-pwd").style.borderRadius = "5px"
  document.getElementById('game-pwd').value = ''
  document.getElementById('game-pwd').placeholder = 'Game PWD not matched!';
});

// socket function for when there is a match in the gameID and gamePWD
socket.on("no issue",()=>{
  if(!entered_char_page){
    socket.emit("join game", document.getElementById("game-id").value)
    load_chars()
    enter_char_page() 
  }
});

// socket function for hiding already selected characters
socket.on("hide chars",(data)=>{
  var parent = document.getElementsByClassName("row")[0];
  for(var i = 0; i <parent.children.length; i++){
    if(data.img == parent.children[i].children[0].label){
      parent.children[i].removeChild(parent.children[i].children[0]);
      parent.removeChild(parent.children[i]);
    }
  }
});


// ------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------

// ------------------------------------------------------------------------------------
// -----------------------------enter game onclick function----------------------------
// ------------------------------------------------------------------------------------
document.getElementById("existing-game").onclick= function(e) {
  e.preventDefault()  
  update_data()
};

// ------------------------------------------------------------------------------------
// ----------------------------------load characters-----------------------------------
// ------------------------------------------------------------------------------------
function load_chars(){
  var Path = "/characters/"; //Folder where we will search for files  
  for (var i = 1; i < 53; i++) {
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
      document.getElementsByClassName("row")[0].appendChild(char_div);

      var image = document.createElement("IMG");
      image.className = "characters_img";
      image.label = Path + i + ".png";
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

// ------------------------------------------------------------------------------------
// --------------------------------input error function--------------------------------
// ------------------------------------------------------------------------------------
function input_error(gameID,gamePWD,username){
  if(gameID == ""){
    document.getElementById("game-id").style.borderColor = "red"
    document.getElementById("game-id").style.borderRadius = "5px"
    document.getElementById('game-id').placeholder = 'Game ID already in use!';
      
  }
  if(gamePWD == ""){
    document.getElementById("game-pwd").style.borderColor = "red"
    document.getElementById("game-pwd").style.borderRadius = "5px"
    document.getElementById('game-pwd').placeholder = 'Game PWD not matched!';
  }
  if(username == ""){
    document.getElementById("game-username").style.borderColor = "red"
    document.getElementById("game-username").style.borderRadius = "5px"
    document.getElementById('game-username').placeholder = 'Game PWD not matched!';
  }
}

// ------------------------------------------------------------------------------------
// --------------------enter character page if the data is correct---------------------
// ------------------------------------------------------------------------------------
function enter_char_page(){
  var gameID = document.getElementById("game-id").value  
  var gamePWD = document.getElementById("game-pwd").value
  var username = document.getElementById("game-username").value 
  if(gameID == "" || gamePWD == "" || username == ""){
    input_error(gameID,gamePWD,username)
  }else{
    entered_char_page = true
    document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
    document.cookie = "name=" + username;
    document.cookie = "gameID=" + gameID;
    document.cookie = "game-pwd=" + gamePWD;
    document.getElementsByClassName("overlay")[0].style.display = "none";
    document.getElementsByClassName("header-contents")[0].src = "/logo2_transparent.png";
    socket.emit("load chars",{gameID:gameID});   
  }
}

// ------------------------------------------------------------------------------------
// -------------when user enters data, update cookie value and show chars--------------
// ------------------------------------------------------------------------------------
function update_data() {
    var gameID = document.getElementById("game-id").value  
    var gamePWD = document.getElementById("game-pwd").value
    var username = document.getElementById("game-username").value 
    //check if the gameID and password is a match
    if(current_ids.includes(gameID)){
      // we need to check if there is a match in id because game id exists already!
      socket.emit("check match", {gameID:gameID,gamePWD:gamePWD})
    }else{
      // this means the gameID is new! so we can just let the person enter since they are the first
      load_chars()  
      enter_char_page()
    }
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
// ------------------------------------------------------------------------------------