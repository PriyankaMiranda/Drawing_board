var socket = io();
var prev = { node: null };
var parent = document.getElementsByClassName("row")[0];

var login = document.getElementById("overlay");

var qn = document.getElementById("qn");


socket.emit("get question")

const cookie_val = document.cookie;
document.getElementById("entry").addEventListener("submit", check_answer, false);
var new_user;

// ----------------------------------------------------------------------------------------------
// get cookie value if it exists, else new user variable is set to true 
try{
  const public_key_1 = cookie_val.split("public_key_1=")[1].split(";")[0];
  const public_key_2 = cookie_val.split("public_key_2=")[1].split(";")[0];
  new_user = false;
}
catch{
  new_user = true;
}
// if the user is not new, we authenticate the user ny checking the public and private key
if(!new_user){
  // this person has public coookie keys
  // authenticating user 
  socket.emit("authenticate")
  // suppose authentication is complete, we load the prev character and the rest of the page
}
// ----------------------------------------------------------------------------------------------
   

function check_answer(e){  
  e.preventDefault();
  // get ans and pass it to the socket to check it with the correct answer  
  const qn_no = document.cookie.split("qn_no=")[1].split(";")[0];
  socket.emit("check ans", {x: qn_no})
  //if correct call the next function to load all data 

}

function load_data(){
  document.getElementById("overlay").style.display = "none";
  var logo = document.getElementById("logo");
  logo.src = "/logo2_transparent.png";
  var instruction = document.getElementById("instruction");
  instruction.innerHTML = "Choose your character";
  socket.emit("load chars");
}
// for old users load their previous character
function get_prev_char(){
    const name = cookie_val.split("name=")[1].split(";")[0];
    const img = cookie_val.split("img=")[1].split(";")[0];
    const img_path = cookie_val.split("img=")[1].split(".")[0];
    if (!(name === undefined) && !(img === undefined)) {
      var my_div = document.createElement("DIV");
      my_div.className = "my character";
      my_div.style.width = "100%";
      my_div.style.padding = "60px";
      my_div.style.opacity = 1;
      my_div.style.textAlign = "center";
      my_div.style.verticalAlign = "middle";
      parent.appendChild(my_div);

      var image = document.createElement("IMG");
      image.id = "my character img";
      image.src = img;
      image.style.width = "15vh";
      image.style.height = "15vh";
      image.onclick = function() {
        submit_operation(this);
      };
      my_div.appendChild(image);

      var div_form = document.createElement("FORM");
      div_form.id = img_path;
      div_form.addEventListener("submit", submit_operation, false);
      my_div.appendChild(div_form);

      var div_ip = document.createElement("INPUT");
      div_ip.style.border = "4px solid black";
      div_ip.style.borderRadius = "4px";
      div_ip.value = name;
      div_form.appendChild(div_ip);
    }
} 


function img_hover(div) {
  if (prev.node === null) {
    console.log("Previous node is null");
  } else {
    var prev_child = prev.node.childNodes;
    prev_child[0].style.opacity = 1;
    prev_child[0].style.transform = "scale(1)";
    prev_child[1].style.display = "none";
  }
  var children = div.childNodes;
  children[0].style.opacity = 0.3;
  children[0].style.transform = "scale(1.25)";
  children[1].style.display = "block";
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

function submit_operation(e) {
  var tagName = e.tagName || e.target.tagName;
  if(tagName == 'IMG'){
    var cookie_name = e.parentNode.childNodes[1].childNodes[0].value;
    var loc_arr = e.parentNode.childNodes[0].src.split("/");
    var arr_len = loc_arr.length;
    var cookie_img = "/"+ loc_arr[arr_len-2]+"/"+loc_arr[arr_len-1]
  }
  else if(tagName == 'FORM'){
    e.preventDefault();
    var cookie_name = e.target.childNodes[0].value;
    var loc_arr = e.target.parentNode.childNodes[0].src.split("/");
    var arr_len = loc_arr.length;
    var cookie_img = "/"+ loc_arr[arr_len-2]+"/"+loc_arr[arr_len-1]
  }

  if (cookie_name == "") {
      children.style.borderColor = "red";
  } else{   
    document.cookie = document.cookie + "; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "img=" + cookie_img;
    document.cookie = "name=" + cookie_name;
    socket.emit("get private keys")
  }
  
  }

function removePrevChars() {
  var elements = document.getElementsByClassName("characters");
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

socket.on("question", (data) => {
  qn.innerHTML = "'"+data.qn+"'"
  document.cookie = "qn_no=" + data.qn_no;
});

socket.on("answer", (data) => {
  var ans = document.getElementById("ans");
  if(ans.value == data.ans){
    // if the answer is correct, continnue loading the page
     load_data()
  }
});

socket.on("private key", (data) => {
  var public_key_1 = Math.random().toString(36).substring(7);
  document.cookie = "public_key_1=" + public_key_1;
  var public_key_2 = CryptoJS.AES.encrypt(public_key_1, data.cookieKey);
  document.cookie = "public_key_2=" + public_key_2;
  window.location.href = "/lobby";
});

socket.on("authenticate", (data) => {
  const public_key_1 = document.cookie.split("public_key_1=")[1].split(";")[0];
  const public_key_2 = document.cookie.split("public_key_2=")[1].split(";")[0];
  var decrypted = CryptoJS.AES.decrypt(public_key_2, data.cookieKey).toString(CryptoJS.enc.Utf8);
  if(decrypted == public_key_1){
    //access granted
    get_prev_char()
    load_data()
  }
});

socket.on("in case no one is in lobby", () => {
  socket.emit("send chars", { username: "", img: "" });
});

socket.on("hide chars globally", (data) => {
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

  if (document.getElementsByClassName("my character").length != 0) {
    for (i = 1; i < 53; i++) {
      if (
        blocked_list.includes(Path + i + ".png") ||
        img == Path + i + ".png"
      ) {
        console.log(Path + i + ".png - Avatar taken");
      } else {
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
          img_hover2(this);
        };

        char_div.onclick = function() {
          img_swap(this);
        };
      }
    }
  } else {
    for (i = 1; i < 53; i++) {
      if (
        blocked_list.includes(Path + i + ".png") ||
        img == Path + i + ".png"
      ) {
        console.log(Path + i + ".png - Avatar taken");
      } else {
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

        var div_form = document.createElement("FORM");
        div_form.className = "characters_form";
        div_form.id = Path + i;
        div_form.style.display = "none";
        div_form.addEventListener("submit", submit_operation, false);
        div_form.style.position = "absolute";
        div_form.style.bottom = "20px";
        char_div.appendChild(div_form);

        var div_inner = document.createElement("INPUT");
        div_inner.style.border = "4px solid black";
        div_inner.style.borderRadius = "4px";
        if (window.screen.width > 500) {
          div_inner.style.width = "10vw";
        } else {
          div_inner.style.width = "20vw";
        }
        div_form.appendChild(div_inner);

        char_div.onmouseover = function() {
          img_hover(this);
        };
      }
    }
  }
});