

var socket = io();
var prev = {node: null};
var parent = document.getElementsByClassName("row")[0];

// for old users load their previous character
if (document.cookie) {
  const cookie_val = document.cookie;
  const name = cookie_val.split('name=')[1].split(';')[0];
  const img = cookie_val.split('img=')[1].split(';')[0];  
  const img_path = cookie_val.split('img=')[1].split('.')[0];  

  if (!(name === undefined) && !(img === undefined)){
    var my_div = document.createElement("DIV");
    my_div.style.flex= "100%";
    my_div.style.padding= "60px";
    my_div.style.opacity= 1;
    my_div.style.transform = "scale(1)"; 
    my_div.style.textAlign = "center";
    parent.appendChild(my_div);

    var image = document.createElement("IMG");  
    image.src = img;       
    image.style.width  = '15vh';
    image.style.height  = '15vh';
    image.onclick = function(){submit_operation2(this)};
    my_div.appendChild(image); 

    var div_form = document.createElement("FORM");
    div_form.id = img_path;
    my_div.appendChild(div_form);

    var div_label = document.createElement("LABEL");  
    div_label.innerHTML = "<h2><b>"+name+"</b></h2></br>Continue with your previous character OR Select a new one below"; 
    div_form.appendChild(div_label);
  }
}

socket.emit('load chars');

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

function submit_operation(e){
  e.preventDefault();
  var children = e.target.childNodes;  
  document.cookie = "name=" + children[1].value;
  document.cookie = "img=" + e.target.id+".png";
  window.location.href = '/lobby';
}

function submit_operation2(e){
  var next_sibling = e.nextSibling;
  document.cookie = "name=" + next_sibling.childNodes[0].innerHTML.split('<b>')[1].split('</b>')[0];
  document.cookie = "img=" + next_sibling.id+".png";
  window.location.href = '/lobby';
}


socket.on('hide chars globally', (data)=>{
  var Path = "/characters/"; //Folder where we will search for files
  var i = 0;
  var blocked_list = data.imgs;

  for (i = 1; i < 53; i++) {
    if (blocked_list.includes(Path+i+".png")){
      console.log(Path+i+".png - Avatar taken")
    }
    else{    
      var char_div = document.createElement("DIV");
      char_div.className = "characters";
      char_div.style.maxWidth = "35vh"
      char_div.style.maxHeight = "35vh"
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
      div_form.id = Path+i;
      div_form.style.display = "none";
      div_form.addEventListener('submit', submit_operation , false);
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

});