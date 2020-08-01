var socket = io();
var prev = { node: null };
var parent = document.getElementsByClassName("row")[0];
var logo = document.getElementById("logo-internal");
logo.src = "/logo2_transparent.png";
var instruction = document.getElementById("instruction");
instruction.innerHTML = "Choose your character";

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

socket.emit("update existing game list")

socket.on("get existing game list", (data) =>{
  socket.emit("get existing game list",data)
});

socket.on("send existing game list", (data) =>{
  socket.emit("send existing game list", data)
});

socket.on("update existing game list for all", (data) =>{
  socket.emit("update existing game list for all", data)
});

socket.on("password error",(data)=>{
  document.getElementById("game-pwd").style.borderColor = "red"
});



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
  // document.cookie = "img=" + data.img;
});

socket.on("reload chars",(data)=>{
  if(data.gameID == gameID && data.gamePWD == gamePWD){
    socket.emit("load chars",{gameID:data.gameID,gamePWD:data.gamePWD,return_id:socket.id})
  }
});

socket.on("send chars",(data)=>{
  socket.emit("update chars",data)
});

document.getElementById('game-username').onkeydown = function(e){
  if(e.keyCode == 13){
    e.preventDefault()
    var gameID = document.getElementById("game-id").value  
    var gamePWD = document.getElementById("game-pwd").value
    var username = document.getElementById("game-username").value 

    //check if the gameID and password is a match
    socket.emit("update data",{gameID:gameID,gamePWD:gamePWD,username:username})

  }
};

document.getElementById("existing-game").onclick= function(e) {
  e.preventDefault()  
  var gameID = document.getElementById("game-id").value  
  var gamePWD = document.getElementById("game-pwd").value
  var username = document.getElementById("game-username").value 
  //check if the gameID and password is a match
  socket.emit("update data",{gameID:gameID,gamePWD:gamePWD,username:username})
};


// for old users load their previous character
// function get_prev_char(){
//     const name = cookie_val.split("name=")[1].split(";")[0];
//     const img = cookie_val.split("img=")[1].split(";")[0];
//     const img_path = cookie_val.split("img=")[1].split(".")[0];
//     if (!(name === undefined) && !(img === undefined)) {
//       var my_div = document.createElement("DIV");
//       my_div.className = "my character";
//       my_div.style.width = "100%";
//       my_div.style.padding = "60px";
//       my_div.style.opacity = 1;
//       my_div.style.textAlign = "center";
//       my_div.style.verticalAlign = "middle";
//       parent.appendChild(my_div);

//       var image = document.createElement("IMG");
//       image.id = "my character img";
//       image.src = img;
//       image.style.width = "15vh";
//       image.style.height = "15vh";
//       image.onclick = function() {
//         submit_operation(this);
//       };
//       my_div.appendChild(image);

//     }
// } 



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

function img_hover2(div) {
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

function img_swap(div) {
  var my_img = document.getElementById("my character img");
  var src = div.firstChild.src;
  div.firstChild.src = my_img.src;
  my_img.src = src;
}

function img_select(div){
  var loc_arr = div.firstChild.src.split("/");
  var arr_len = loc_arr.length;
  var cookie_img = "/"+ loc_arr[arr_len-2]+"/"+loc_arr[arr_len-1]
  document.cookie = "img=" + cookie_img;
  window.location.href = "/lobby";
}



function removePrevChars() {
  var elements = document.getElementsByClassName("characters");
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}


socket.on("in case no one is in lobby", (data) => {
  socket.emit("send chars", { username: "", img: "", return_id:data.return_id,chars:data.chars,imgs:data.imgs});
});

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
