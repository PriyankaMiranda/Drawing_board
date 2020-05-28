'use strict';
(function() {
var socket = io();

socket.on('userdata', onSelectAvatar);

function onSelectAvatar(data){
  update(data.elem);
}

var Path = "./lobby/game/leaderboard/assets/characters/"; //Folder where we will search for files
var img_Path =  "/assets/characters/";
var i = 0;
var all_elems = 0;
var parent = document.getElementsByClassName("row")[0];
var prev = {node: null};
var blocked_list = [];

for (i = 1; i < 53; i++) {
  if (blocked_list.includes(i)){
    console.log("Avatar taken")
  }
  else{    
  var char_div = document.createElement("DIV");
  char_div.className = "characters";
  char_div.style.maxWidth = "25vh"
  char_div.style.maxHeight = "25vh"
  char_div.style.flex= "25%";
  char_div.style.padding= "60px";
  char_div.style.opacity= 1;
  char_div.style.transform = "scale(1)"; 
  parent.appendChild(char_div);

  var image = document.createElement("IMG");  
  image.className = "characters_img";
  image.src = Path+i+".png";       
  image.style.width  = '100%';
  image.style.height  = '100%';
  char_div.appendChild(image);  

  var div_form = document.createElement("FORM");
  div_form.className = "characters_form";
  div_form.id = img_Path+i;
  div_form.style.display = "none";
  div_form.addEventListener('submit', user_operation , false);
  char_div.appendChild(div_form);


  var div_label = document.createElement("LABEL");  
  div_label.className = "characters_label";
  div_label.style.width  = '100%';
  div_label.innerHTML = ""; 
  div_form.appendChild(div_label);

  var div_inner = document.createElement("INPUT");
  div_inner.style.border= '4px solid black';
  div_inner.style.borderRadius= '4px';
  div_inner.style.width  = '100%';
  div_inner.style.height  = '100%';
  div_form.appendChild(div_inner);

  char_div.onmouseover = function(){img_hover(this)};
  }
} 


function img_hover(div){
  if(prev.node === null){
    console.log("Previous node is null")
  }
  else{
    var prev_child = prev.node.childNodes;
    prev_child[0].style.opacity= 1;
    prev_child[0].style.transform = "scale(1)";
    prev_child[1].style.display = "none";
  }
  var children = div.childNodes;
  children[0].style.opacity= 0.3;
  children[0].style.transform = "scale(1.25)"; 
  children[1].style.display = "block";
  prev.node = div;
}

function user_operation(e){
  var children = e.target.childNodes;  
  document.cookie = "name=" + children[1].value;
  document.cookie = "img=" + e.target.id+".png";
  update(e)
}

function update(e){
  e.style.display = 'none'
  var children = e.target.childNodes;
  children[0].style.opacity= 0.1; 
  children[1].style.display = "none";

  socket.emit('userdata', {elem: e});

  e.preventDefault();
  // window.location.href = '/lobby';
}


})();
