if (!document.cookie) {
  window.location.href = '/';
}
//-----------------------------------------------------------------------------------------
// ----------------------------------initialize variables----------------------------------
//----------------------------------------------------------------------------------------- 
var socket = io();
var FADE_TIME = 150; // ms
var TYPING_TIMER_LENGTH = 10; // ms
var COLORS = ["#008b8b","#006060","#1b7742","#002627","#3477db","#870c25","#d50000","#d24d57",
              "#aa2e00","#d35400","#aa6b51","#554800","#1c2833","#34515e","#4b6a88","#220b38",
              "#522032","#7d314c","#483d8b","#77448b","#8a2be2","#a74165","#9b59b6","#db0a5b"];
var $window = $(window);
var $messages = $(".messages"); // Messages area
var $inputMessage = $(".inputMessage"); // Input message input box
var $chatPage = $(".chat.page"); // The chatroom page
var typing = false;
var lastTypingTime;
var username;
var img;
var gameID;
var score = 0;
var word = "";
var timerVal = 0;
const cookie_val = document.cookie;

var words_completed = [];

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
//-----------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------- 

//-----------------------------------------------------------------------------------------
//-------------------------------Set drawing board variables-------------------------------
//-----------------------------------------------------------------------------------------
var canvas = document.getElementsByClassName('whiteboard')[0];
var colors = document.getElementsByClassName('color pen');
let context = canvas.getContext("2d");
let rect = canvas.getBoundingClientRect();
var drawing = false;
var isChrome = !!window.chrome;
var isMobile = false;
if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
  || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
  isMobile = true;
}
var current = {color: 'black', prev_color: 'black',lineWidth: 5};

var overlay = document.getElementsByClassName("overlay")[0]
while (overlay.firstChild) overlay.removeChild(overlay.firstChild);
overlay.style.display = "block";
var para = document.createElement("p");
var my_time = 3
para.innerHTML = "Game starts in "+(my_time);
overlay.appendChild(para);

var downloadTimer = setInterval(function(){
  if(my_time <= 0){ clearInterval(downloadTimer); }
  my_time -= 1;
  para.innerHTML = "Game starts in "+(my_time);
  if(my_time == -1){  
    overlay.style.display = "none"; 
    socket.emit("start game", {gameID : gameID}); 
  }
}, 1000); 
//-----------------------------------------------------------------------------------------  
//-----------------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------------
//---------------------Cascade of events based on entry for every user---------------------
//-----------------------------------------------------------------------------------------

// join game
socket.emit("join game",{gameID:gameID});  

socket.on("set data", (data) => {
  if(data.words[words_completed.length] == undefined){ socket.emit("next round", {gameID : gameID}); }
  if(data.totalRounds <= 0){  socket.emit("next round", {gameID : gameID});  }
  else{
    overlay.style.display = "none"; 
    document.getElementById("word").innerHTML = data.words[words_completed.length]; 
    socket.emit("set answer", {gameID : gameID, answer : data.words[words_completed.length]})

    if(!words_completed.includes(data.words[words_completed.length])){
      words_completed.push(data.words[words_completed.length])
    }

    var timerVal = data.time
    var downloadTimer = setInterval(function(){
      if(timerVal <= 0){ clearInterval(downloadTimer); }
      if(timerVal <=  5){ document.getElementById("timer").style.color = "#BE2625"; }
      else{ document.getElementById("timer").style.color = "#005582"; }

      document.getElementById("timer").innerHTML = timerVal;
      if(timerVal > Math.ceil(3*data.time/4)){
        socket.emit("set clue" , {gameID : gameID, clue:data.clues[words_completed.length-1], time: timerVal})
      }else if(timerVal > Math.ceil(data.time/4)){ 
        socket.emit("set clue" , {gameID : gameID, clue:data.clues1[words_completed.length-1], time: timerVal})
      }else{ 
        socket.emit("set clue" , {gameID : gameID, clue:data.clues2[words_completed.length-1], time: timerVal})
      }

      timerVal -= 1;
      if(timerVal == -1){
        socket.emit("show answer", {gameID : gameID, word : data.words[words_completed.length - 1]}); 
        setTimeout(function(){  socket.emit("next round", {gameID : gameID});   }, 2000);
      }
    }, 1000);

  }

});

socket.on("set clue", (data) => {
  overlay.style.display = "none"; 
  document.getElementById("word").innerHTML = data.clue;
  timerVal = data.time 
  document.getElementById("timer").innerHTML = data.time;
  if(data.time <=  5){ document.getElementById("timer").style.color = "#BE2625"; }
  else{ document.getElementById("timer").style.color = "#005582"; } 
});

socket.on("show answer", (data) => {
  overlay.style.opacity = "0.5";
  while (overlay.firstChild) overlay.removeChild(overlay.firstChild);
  document.getElementById("word").innerHTML = "";
  document.getElementById("timer").innerHTML = "";
  overlay.style.display = "block";
  var para = document.createElement("p");
  para.innerHTML = "Answer: "+data.word;
  overlay.appendChild(para);
  setTimeout(function(){ overlay.style.display = "none"; }, 2000);
});



socket.on("game completed", () => {
  while (overlay.firstChild) overlay.removeChild(overlay.firstChild);
  document.getElementById("word").innerHTML = "";
  document.getElementById("timer").innerHTML = "";
  overlay.style.display = "block";
  var para = document.createElement("p");
  para.innerHTML = "Game complete";
  overlay.appendChild(para);
  overlay.style.opacity = "1";
  showChars()
});

socket.on("enter lobby", () => {
  window.location.href = "/lobby"
});


// hide chars in homepage
socket.emit("send chars when entering", {img:img,gameID:gameID});
// reload chars in lobby
socket.emit("load chars on lobby",{gameID:gameID,gamePWD:gamePWD,username:username});  
// get chars from all users present in lobby
socket.on("load chars on lobby", () => {
  removeParticipantsImg();
  socket.emit("load old chars on lobby", {id:socket.id,gameID:gameID});
  socket.emit("display chars for lobby", {gameID:gameID,username:username,img:img,id:socket.id});
});
// get chars from all old users present
socket.on("load old chars on lobby", (data) => socket.emit("display old chars for lobby", {username:username,img:img,id:socket.id,return_address:data.id}));
// display all the details of the users present in lobby
socket.on("display chars for lobby", (data) => addParticipantsImg({char: data.username, img: data.img, id:data.id}));
// reload lobby when user leaves
socket.on("reload lobby page", (data) => {
  removeParticipantsImg();
  socket.emit("load chars on lobby",{gameID:gameID,gamePWD:gamePWD,username:username});
});
//-----------------------------------------------------------------------------------------  
//-----------------------------------------------------------------------------------------  

//-----------------------------------------------------------------------------------------  
//--------------------------------------Socket Events--------------------------------------  
//-----------------------------------------------------------------------------------------  

// for the users using the application, send the existing game list
socket.on("get ongoing games", (data) => socket.emit("send game data",{id:data.id,gameID:gameID,img:img}));
// checking if the data set is correct or not
socket.on("check match",(data)=>{
  if(data.gamePWD != gamePWD){ socket.emit("send issue",{id:data.id}) }
  else{ socket.emit("no issue",{id:data.id}) }
});
// get chars from all users present in game to hide in homempage
socket.on("get chars", (data) => socket.emit("send chars", {img:img,id:data.id}));
// on draw socket event 
socket.on('drawing', onDrawingEvent); 
// Whenever the server emits 'new message', update the chat body
socket.on("new message", (data) => {
  addChatMessage(data)
});
// When the answer is right, dont reflect it across the game
socket.on("correct guess", (data) => { 
  addChatMessage({username : "Server ", message : "Correct answer!"})
  addChatMessage(data) 
});
// Update score 
socket.on("update score", (data) => {
  var parent = document.getElementById("row_chars");
  var children = parent.children;

  for(var j = 0; j < data.ids.length; j++){
    for(var i = 0; i < children.length; i++){
      if(data.ids[j] == children[i].children[0].alt){ 
        children[i].children[1].children[1].innerText = data.scores[j]
      }
    }
  }
  reorderCharacters()
});
// Whenever the server emits 'typing', show the typing message
socket.on("typing in game", (data) => addChatTyping(data));
// Whenever the server emits 'stop typing', kill the typing message
socket.on("stop typing in game", (data) => removeChatTyping(data));

//-----------------------------------------------------------------------------------------  
//-----------------------------------------------------------------------------------------  

//-----------------------------------------------------------------------------------------
//-------------------------------Event listeners for drawing-------------------------------
//-----------------------------------------------------------------------------------------
canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('mousemove', throttle(onMouseMove, 1), false);
//Touch support for mobile devices
canvas.addEventListener('touchstart', onMouseDown, false);
canvas.addEventListener('touchend', onMouseUp, false);
canvas.addEventListener('touchcancel', onMouseUp, false);
canvas.addEventListener('touchmove', throttle(onMouseMove, 1), false);

document.getElementsByClassName("color refresh")[0].addEventListener('click', refreshPage, false);
for (var i = 0; i < colors.length; i++){ colors[i].addEventListener('click', onColorUpdate, false); }
document.getElementsByClassName("color pencil")[0].addEventListener('click', setOrigColor, false);

$window.keydown((event) => {
  // When the client hits ENTER on their keyboard, update message for everyone
  if (event.which === 13) {
    sendMessage();
    socket.emit("stop typing in game", {gameID:gameID});
    typing = false;
  }
});

$inputMessage.on("input", () => updateTyping()); 
// Focus input when clicking on the message input's border
$inputMessage.click(() => $inputMessage.focus());

//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------



//-----------------------------------------------------------------------------------------
//------------------------Clearscreen and color update and functions-----------------------
//-----------------------------------------------------------------------------------------

function onColorUpdate(e){
  refreshAllBorders()
  current.prev_color = current.color;
  current.color = e.target.style.backgroundColor;
  current.lineWidth = 5;
  if (current.color == 'black'){ e.target.style.border = "thick solid rgba(255, 255, 255, .5)";}
  else{ e.target.style.border = "thick solid rgba(0, 0, 0, .5)"; }
  if(current.color == 'white'){ current.lineWidth = 45; }
  context.beginPath();
}

function setOrigColor(e){
  refreshAllBorders()
  e.target.style.border = "thick solid rgba(0, 0, 0, .5)";
  if(current.color == 'white'){  
    if(current.prev_color == 'white'){ current.color = 'black'; }
    else{ current.color = current.prev_color; }
  }
  current.lineWidth = 5;
  context.beginPath();
}

function refreshPage (e){
  refreshAllBorders()
  e.target.style.border = "thick solid rgba(0, 0, 0, .5)";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.closePath();
  context.beginPath();
}

function refreshAllBorders(){
  var all_colors = document.getElementsByClassName("color")
  for (var i = 0; i < all_colors.length; i++) { all_colors[i].style.border = "thick solid rgba(255, 255, 255, .5)"; } 
}
//-----------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------  

//-----------------------------------------------------------------------------------------
//------------------------------------drawing functions------------------------------------
//-----------------------------------------------------------------------------------------
function onMouseDown(e){
  e.preventDefault();
  e.stopPropagation();
  if(isChrome || isMobile){ drawing = true; }
  else{
    if (drawing == false){ drawing = true; }
    else{ drawing = false; } 
  }
  if(typeof event.touches === 'undefined'){
    current.x = ((e.clientX - rect.left) / (rect.right - rect.left)) *canvas.width;
    current.y = ((e.clientY - rect.top) / (rect.bottom - rect.top)) *canvas.height;
  }
  else{
    current.x = ((e.touches[0].clientX - rect.left) / (rect.right - rect.left)) *canvas.width;
    current.y = ((e.touches[0].clientY - rect.top) / (rect.bottom - rect.top)) *canvas.height;
  }
}

function onMouseUp(e){
  e.preventDefault();
  e.stopPropagation();
  if (!drawing) { return; }
  if(isChrome|| isMobile){ drawing = false; }
}

function onMouseMove(e){
  e.preventDefault();
  e.stopPropagation();
  if (!drawing) { return; }
  if(typeof event.touches === 'undefined'){
    current.x_new = ((e.clientX - rect.left) / (rect.right - rect.left)) *canvas.width;
    current.y_new = ((e.clientY - rect.top) / (rect.bottom - rect.top)) *canvas.height;
  }
  else{
    current.x_new = ((e.touches[0].clientX - rect.left) / (rect.right - rect.left)) *canvas.width;
    current.y_new = ((e.touches[0].clientY - rect.top) / (rect.bottom - rect.top)) *canvas.height;
  }
  drawLine(current.x, current.y, current.x_new, current.y_new,  current.lineWidth, current.color, true);
  if(typeof event.touches === 'undefined'){
    current.x = ((e.clientX - rect.left) / (rect.right - rect.left)) *canvas.width;
    current.y = ((e.clientY - rect.top) / (rect.bottom - rect.top)) *canvas.height;
  }
  else{
    current.x = ((e.touches[0].clientX - rect.left) / (rect.right - rect.left)) *canvas.width;
    current.y = ((e.touches[0].clientY - rect.top) / (rect.bottom - rect.top)) *canvas.height;
  }
}

function onDrawingEvent(data){
  drawLine(data.x0 , data.y0 , data.x1 , data.y1 , data.lineWidth, data.color);
}

function drawLine(x0, y0, x1, y1, lineWidth, color, emit){
  context.lineWidth = lineWidth;
  context.strokeStyle = color;
  context.beginPath();
  context.moveTo(x0,y0);
  context.lineTo(x1,y1);
  context.stroke();
  context.closePath();

  if (!emit) { return; }

  socket.emit('drawing', { x0: x0 , y0: y0 , x1: x1 , y1: y1 ,lineWidth: context.lineWidth ,color: color,gameID: gameID });
}

//to limit the number of events per second
function throttle(callback, delay) {
  var previousCall = new Date().getTime();
  return function() {
    var time = new Date().getTime();  
    if ((time - previousCall) >= delay) {
      previousCall = time;
      callback.apply(null, arguments);
    }
  };
}
//-----------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------- 

//-----------------------------------------------------------------------------------------
//--------------------------------load characters fucntions--------------------------------
//----------------------------------------------------------------------------------------- 

const removeParticipantsImg = (data) => {
  var parent = document.getElementById("row_chars");
  while (parent.firstChild) parent.removeChild(parent.firstChild);
};

const addParticipantsImg = (data) => {

  var parent = document.getElementById("row_chars");
  var children = parent.children;
  var char_list = []
  var img_list = []
  
  for(var i = 0; i < children.length; i++){
    char_list.push(children[i].children[1].children[0].innerText)
    img_list.push(children[i].children[0].id)
  }

  if(!char_list.includes(data.char) && !img_list.includes(data.img)){
    var char_div = document.createElement("DIV");
    char_div.className = "characters";
    parent.appendChild(char_div);

    var image = document.createElement("IMG");
    image.className = "characters_img";
    image.src = data.img;
    image.alt = data.id;
    image.style.width = "100%";
    image.style.height = "100%";
    image.id = data.img;
    char_div.appendChild(image);

    var div_form = document.createElement("FORM");
    div_form.className = "characters_form";
    div_form.style.textAlign = "center";
    div_form.style.fontStyle = "italic";
    div_form.style.fontFamily = "cursive";
    char_div.appendChild(div_form);

    var div_label = document.createElement("LABEL");
    div_label.className = "characters_label";
    div_label.innerHTML = data.char;
    div_form.appendChild(div_label);

    var div_label2 = document.createElement("LABEL");
    div_label2.style.display = "none";
    div_label2.className = "characters_score";
    div_label2.innerHTML = "0";
    div_form.appendChild(div_label2);
  }
};

function reorderCharacters(){
  var parent = document.getElementById("row_chars");
  var children = parent.children;

  var char_list = []
  var img_list = []
  var id_list = []
  var score_list = []

  for(var i = 0; i < children.length; i++){
    char_list.push(children[i].children[1].children[0].innerText)
    img_list.push(children[i].children[0].src)
    id_list.push(children[i].children[0].alt)
    score_list.push(parseInt(children[i].children[1].children[1].innerText))
  }

  for (let i = 0; i < children.length; i++) {
    for (let j = i; j < children.length; j++) {
      if (score_list[i] < score_list[j]) {
        let temp = score_list[i]; 
        score_list[i] = score_list[j]; 
        score_list[j] = temp; 
        
        let temp1 = char_list[i]; 
        char_list[i] = char_list[j]; 
        char_list[j] = temp1; 
        
        let temp2 = img_list[i]; 
        img_list[i] = img_list[j]; 
        img_list[j] = temp2; 

        let temp3 = id_list[i]; 
        id_list[i] = id_list[j]; 
        id_list[j] = temp3; 
      };
    };
  }

  for(var i = 0; i < children.length; i++){
    children[i].children[0].src = img_list[i]; 
    children[i].children[0].alt = id_list[i];
    children[i].children[0].id = img_list[i];
    children[i].children[1].children[0].innerHTML = char_list[i];
    children[i].children[1].children[1].innerHTML = score_list[i];
  }
}

function showChars(){
  reorderCharacters()

  var children = document.getElementById("row_chars").children;
  var char_list = []
  var img_list = []
  var id_list = []
  var score_list = []

  for(var i = 0; i < children.length; i++){
    char_list.push(children[i].children[1].children[0].innerText)
    img_list.push(children[i].children[0].src)
    id_list.push(children[i].children[0].alt)
    score_list.push(parseInt(children[i].children[1].children[1].innerText))
  }

  while (overlay.firstChild) overlay.removeChild(overlay.firstChild);
  var para = document.createElement("h1");
  para.innerHTML = "Leaderboard";
  overlay.appendChild(para);

  var leaderboard = document.createElement("DIV");
  leaderboard.className = "leaderboard";
  leaderboard.display = "flex";
  leaderboard.alignItems = "center"; 
  leaderboard.justifyContent = "center";
  overlay.appendChild(leaderboard);

  let size = 100
  for(var i = 0; i < children.length; i++){
    var char_div = document.createElement("DIV");
    char_div.className = "characters";
    leaderboard.appendChild(char_div);

    var image = document.createElement("IMG");
    image.className = "characters_img";
    image.src = img_list[i];
    image.alt = id_list[i];
    image.style.width = String(size/2)+"%";
    image.style.height = String(size/2)+"%";
    image.id = img_list[i];
    char_div.appendChild(image);

    var div_form = document.createElement("FORM");
    div_form.className = "characters_form";
    div_form.style.textAlign = "center";
    div_form.style.fontStyle = "italic";
    div_form.style.fontFamily = "cursive";
    char_div.appendChild(div_form);

    var div_label = document.createElement("LABEL");
    div_label.className = "characters_label";
    div_label.innerHTML = char_list[i];
    div_form.appendChild(div_label);

    var div_label2 = document.createElement("LABEL");
    div_label2.className = "characters_score";
    div_label2.innerHTML = " : "+String(score_list[i]);
    div_form.appendChild(div_label2);
    // size = size - (20*size/100) 
  }

}
//-----------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------- 

//-----------------------------------------------------------------------------------------
//-----------------------------------messaging functions-----------------------------------
//----------------------------------------------------------------------------------------- 

// sends chat message
const sendMessage = () => {
  var message = ' '+$inputMessage.val();
  message = cleanInput(message);
  document.getElementsByClassName('inputMessage')[0].value = "";
  socket.emit("check answer", {username:username,message:message,gameID:gameID,timer:timerVal});
};

// structures the chat message
const addChatMessage = (data) => {
  // Don't fade the message in if there is an 'X was typing'
  var $typingMessages = getTypingMessages(data);
  if ($typingMessages.length !== 0) { $typingMessages.remove(); }
  var $usernameDiv = $('<span class="username"/>').text(data.username).css("color", getUsernameColor(data.username));
  var $messageBodyDiv = $('<span class="messageBody">').text(data.message);
  var typingClass = data.typing ? "typing" : "";
  var $messageDiv = $('<p class="message"/>').data("username", data.username).addClass(typingClass).append($usernameDiv, $messageBodyDiv);
  addMessageElement($messageDiv);
  return $messageDiv
};

// Gets the 'X is typing...' messages of a user
const getTypingMessages = (data) => {
  return $(".typing.message").filter(function(i) { return data.username; });
};

// Adds a message element to the messages and scrolls to the bottom
// el - The element to add as a message
// options.fade - If the element should fade-in (default = true)
// options.prepend - If the element should prepend
// all other messages (default = false)
const addMessageElement = (el, options) => {
  var $el = $(el);
  // Setup default options
  if (!options) { options = {}; }
  if (typeof options.fade === "undefined") { options.fade = true; }
  if (typeof options.prepend === "undefined") { options.prepend = false; }
  // Apply options
  if (options.fade) { $el.hide().fadeIn(FADE_TIME); }
  if (options.prepend) { $messages.prepend($el);} 
  else { $messages.append($el); }

  $messages[0].scrollTop = $messages[0].scrollHeight;
};


// Adds the visual chat typing message
const addChatTyping = (data) => {
  data.typing = true;
  data.message = " is typing....";
  addChatMessage(data).fadeOut(function() { $(this).remove(); });
};

// Removes the visual chat typing message
const removeChatTyping = (data) => { getTypingMessages(data); };

// Updates the typing event
const updateTyping = () => {
  if (!typing) {
    typing = true;
    socket.emit("typing in game", { username: username ,gameID:gameID});
  }

  lastTypingTime = new Date().getTime();
  setTimeout(() => {
    var typingTimer = new Date().getTime();
    var timeDiff = typingTimer - lastTypingTime;
    if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
      socket.emit("stop typing in game", {gameID:gameID});
      typing = false;
    }
  }, TYPING_TIMER_LENGTH);
};
//-----------------------------------------------------------------------------------------  
// -------------------------------Messaging utility functions------------------------------
//-----------------------------------------------------------------------------------------
// Log a message
const log = (message, options) => {
  var $el = $("<p>").addClass("log").text(message);
  addMessageElement($el, options);
};

// Prevents input from having injected markup
const cleanInput = (input) => { return $("<div/>").text(input).html(); };

// Gets the color of a username through our hash function
const getUsernameColor = (username) => {
  // Compute hash code
  var hash = 7;
  for (var i = 0; i < username.length; i++) { hash = username.charCodeAt(i) + (hash << 5) - hash; }
  // Calculate color
  var index = Math.abs(hash % COLORS.length);
  return COLORS[index];
};
//-----------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------- 
