'use strict';


(function() {
console.log(document.cookie)

var Path = "./game/leaderboard/assets/characters/"; //Folder where we will search for files
var i = 0;
var all_elems = 0;
var parent = document.getElementsByClassName("row")[0];



for (i = 1; i < 53; i++) {
  var char_div = document.createElement("DIV");
  char_div.className = "characters";
  char_div.style.maxWidth = "25vh"
  char_div.style.maxHeight = "25vh"
  char_div.style.flex= "25%";
  char_div.style.padding= "40px";
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
  div_form.style.display = "block";
  div_form.style.textAlign = "center";
  div_form.style.fontStyle = "italic";
  div_form.style.fontFamily = "cursive";
  char_div.appendChild(div_form);


  var div_label = document.createElement("LABEL");  
  div_label.className = "characters_label";
  div_label.style.width  = '100%';
  div_label.innerHTML = "arger"; 
  div_form.appendChild(div_label);

} 


})();
