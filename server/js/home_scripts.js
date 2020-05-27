var socket = io();
var prev = { node: null };
var parent = document.getElementsByClassName("row")[0];

// for old users load their previous character
if (document.cookie) {
    const cookie_val = document.cookie;
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
        image.className = "my character img";
        image.src = img;
        image.style.width = "15vh";
        image.style.height = "15vh";
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
    console.log("img sawp!")

}

function submit_operation(e) {
    e.preventDefault();
    var children = e.target.childNodes;
    if (children[0].value == "") {
        children[0].style.borderColor = "red";
    } else {
        document.cookie = "name=" + children[0].value;
        document.cookie = "img=" + e.target.id + ".png";
        window.location.href = "/lobby";
    }
}

function removePrevChars() {
    var elements = document.getElementsByClassName("characters");
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}

socket.emit("load chars");

socket.on("in case no one is in lobby", () => {
    socket.emit("send chars", { username: "", img: "" });
});

socket.on("hide chars globally", (data) => {
    removePrevChars();

    var Path = "/characters/"; //Folder where we will search for files
    var i = 0;
    var blocked_list = data.imgs;
    
    const cookie_val = document.cookie;

    const img = cookie_val.split("img=")[1].split(";")[0];
    
    if (document.getElementsByClassName("my character").length != 0) {
        for (i = 1; i < 53; i++) {
            if (blocked_list.includes(Path + i + ".png") || img == Path + i + ".png") {
                console.log(Path + i + ".png - Avatar taken");
            } else {
                var char_div = document.createElement("DIV");
                char_div.className = "characters";
                if (window.screen.width > 500){
                  char_div.style.width = "15vw";
                  char_div.style.height = "15vw";
                }else{
                  char_div.style.width = "30vw";
                  char_div.style.height = "30vw";
                }
                char_div.style.flex = "25%";
                char_div.style.padding = "30px";
                char_div.style.position =  "relative";
                parent.appendChild(char_div);

                var image = document.createElement("IMG");
                image.className = "characters_img";
                image.src = Path + i + ".png";
                if (window.screen.width > 500){
                  image.style.width = "10vw";
                }else{
                  image.style.width = "20vw";      
                }
                image.style.position =  "absolute";
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
            if (blocked_list.includes(Path + i + ".png") || img == Path + i + ".png") {
                console.log(Path + i + ".png - Avatar taken");
            } else {
                var char_div = document.createElement("DIV");
                char_div.className = "characters";
                if (window.screen.width > 500){
                  char_div.style.width = "15vw";
                  char_div.style.height = "15vw";
                }else{
                  char_div.style.width = "30vw";
                  char_div.style.height = "30vw";
                }
                char_div.style.flex = "25%";
                char_div.style.padding = "30px";
                char_div.style.position =  "relative";
                parent.appendChild(char_div);

                var image = document.createElement("IMG");
                image.className = "characters_img";
                image.src = Path + i + ".png";
                if (window.screen.width > 500){
                  image.style.width = "10vw";
                }else{
                  image.style.width = "20vw";      
                }
                image.style.position =  "absolute";
                image.style.top = "10px";
                char_div.appendChild(image);

                var div_form = document.createElement("FORM");
                div_form.className = "characters_form";
                div_form.id = Path + i;
                div_form.style.display = "none";
                div_form.addEventListener("submit", submit_operation, false);
                div_form.style.position =  "absolute";
                div_form.style.bottom = "20px";
                char_div.appendChild(div_form);

                var div_inner = document.createElement("INPUT");
                div_inner.style.border = "4px solid black";
                div_inner.style.borderRadius = "4px";
                if (window.screen.width > 500){
                  div_inner.style.width = "10vw";
                }else{
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