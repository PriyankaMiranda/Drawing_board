'use strict';


(function() {

// var socket = io();
// socket.on('login', onDrawingEvent);

var Path = "./images/characters/"; //Folder where we will search for files
var img_locs = []
var i = 0;
var all_elems = 0;

var parent = document.getElementById("row_id");

for (i = 1; i < 53; i++) {
  img_locs.push(Path+i+".png");

  var char_div = document.createElement("DIV");
  char_div.style.maxWidth = "25vh"
  char_div.style.maxHeight = "25vh"
  char_div.style.display= "flex";
  char_div.style.flexDirection= "column";  
  char_div.style.flex= "25%";
  char_div.style.padding= "20px";
  char_div.className = "characters";
  char_div.style.opacity= 1;
  char_div.style.transform = "scale(1)"; 
  parent.appendChild(char_div);

  var image = document.createElement("IMG");  
  image.src = Path+i+".png";       
  image.style.maxWidth  = '100%';
  image.style.maxWidth  = '100%';
  image.className = "characters_img";
  char_div.appendChild(image);  

  var div_form = document.createElement("FORM");
  div_form.style.textAlign= 'center';
  div_form.className = "characters_form";
  div_form. style. display = "none";
  char_div.appendChild(div_form);

  var div_inner = document.createElement("INPUT");
  div_inner.type= 'text';
  div_inner.style.border= '4px solid black';
  div_inner.style.borderRadius= '4px';
  div_form.appendChild(div_inner);
  
  char_div.onmouseover = function(){img_hover(this)};
} 


function img_hover(div){

  all_elems=document.getElementsByClassName("characters_img")
  for (i = 0; i < all_elems.length; i++) {
    all_elems[i].style.opacity= 1;
    all_elems[i].style.transform = "scale(1)"; 
  }

  all_elems=document.getElementsByClassName("characters_form")
  for (i = 0; i < all_elems.length; i++) {
    all_elems[i].style.display = "none";
  }

  var children = div.childNodes;
  children[0].style.opacity= 0.3;
  children[0].style.transform = "scale(1.25)"; 
  children[1].style.display = "block";
}



})();
