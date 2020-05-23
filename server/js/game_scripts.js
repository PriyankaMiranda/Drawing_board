if (!document.cookie) {
  window.location.href = '/';
}

var socket = io();
socket.on('drawing', onDrawingEvent);

//------------------------------------Load leader board------------------------------------
var Path = "./images/characters/"; //Folder where we will search for files
var leader_board = document.getElementsByClassName('img');
for (i = 0; i < leader_board.length; i++) {
  leader_board[i].src =  Path+i+".png";  
}

//-----------------------------------------------------------------------------------------  

//------------------------------------Set drawing board------------------------------------
var canvas = document.getElementsByClassName('whiteboard')[0];
var colors = document.getElementsByClassName('color pen');
let context = canvas.getContext("2d");
let rect = canvas.getBoundingClientRect();
//-----------------------------------------------------------------------------------------  

//--------------------------------Color params and functions-------------------------------
var current = {color: 'black', prev_color: 'black',lineWidth: 5};
for (var i = 1; i < colors.length; i++){
  colors[i].addEventListener('click', onColorUpdate, false);
}

function onColorUpdate(e){
  current.prev_color = current.color;
  current.color = e.target.style.backgroundColor;
  current.lineWidth = 5;
  if(current.color == 'white'){
    current.lineWidth = 25;
  }
  context.beginPath();
}
//-----------------------------------------------------------------------------------------  

//---------------------------------set current pizel level---------------------------------
var orig_zoom = window.visualViewport.scale;
function checkSizeChange(e){
  var zoom = window.visualViewport.scale;
  if (orig_zoom != zoom){
    console.log("zoomed")
    e.preventDefault();
    e.stopPropagation();
  }
} 

//-----------------------------------------------------------------------------------------  

//--------------------------------------Pen selector---------------------------------------
document.getElementsByClassName("color pencil")[0].addEventListener('click', function (e){
  if(current.color == 'white'){  
    if(current.prev_color == 'white'){
      current.color = 'black';
    }
    else{
      current.color = current.prev_color;  
    }
  }
  context.beginPath();
});
//-----------------------------------------------------------------------------------------  

//--------------------------------------Refresh screen-------------------------------------
document.getElementsByClassName("color refresh")[0].addEventListener('click', function (e){
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.closePath();
  context.beginPath();
});
//-----------------------------------------------------------------------------------------  

//-------------------------------Event listeners for drawing-------------------------------
// Mouse support for computer
canvas.addEventListener('mousedown', onMouseDown, false);
canvas.addEventListener('mouseup', onMouseUp, false);
canvas.addEventListener('mouseout', onMouseUp, false);
canvas.addEventListener('mousemove', throttle(onMouseMove, 1), false);
//Touch support for mobile devices
canvas.addEventListener('touchstart', onMouseDown, false);
canvas.addEventListener('touchend', onMouseUp, false);
canvas.addEventListener('touchcancel', onMouseUp, false);
canvas.addEventListener('touchmove', throttle(onMouseMove, 1), false);
//-----------------------------------------------------------------------------------------

//---------------------------mouse move event listener functions---------------------------
var drawing = false;
function onMouseDown(e){
  checkSizeChange(e)
  drawing = true;
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
  checkSizeChange(e)
  if (!drawing) { return; }
  drawing = false;
  try{
    if(typeof event.touches === 'undefined'){
      current.x_new = ((e.clientX - rect.left) / (rect.right - rect.left)) *canvas.width;
      current.y_new = ((e.clientY - rect.top) / (rect.bottom - rect.top)) *canvas.height;
    }
    else{
      current.x_new = ((e.touches[0].clientX - rect.left) / (rect.right - rect.left)) *canvas.width;
      current.y_new = ((e.touches[0].clientY - rect.top) / (rect.bottom - rect.top)) *canvas.height;
    }
  drawLine(current.x, current.y, current.x_new, current.y_new, current.color, true);
  }
  catch{
   console.log("Drawing line complete") 
  }
}

function onMouseMove(e){
  checkSizeChange(e)
  if (!drawing) { return; }
  if(typeof event.touches === 'undefined'){
    current.x_new = ((e.clientX - rect.left) / (rect.right - rect.left)) *canvas.width;
    current.y_new = ((e.clientY - rect.top) / (rect.bottom - rect.top)) *canvas.height;
  }
  else{
    current.x_new = ((e.touches[0].clientX - rect.left) / (rect.right - rect.left)) *canvas.width;
    current.y_new = ((e.touches[0].clientY - rect.top) / (rect.bottom - rect.top)) *canvas.height;
  }
  drawLine(current.x, current.y, current.x_new, current.y_new, current.color, true);
  if(typeof event.touches === 'undefined'){
    current.x = ((e.clientX - rect.left) / (rect.right - rect.left)) *canvas.width;
    current.y = ((e.clientY - rect.top) / (rect.bottom - rect.top)) *canvas.height;
  }
  else{
    current.x = ((e.touches[0].clientX - rect.left) / (rect.right - rect.left)) *canvas.width;
    current.y = ((e.touches[0].clientY - rect.top) / (rect.bottom - rect.top)) *canvas.height;
  }
}
//-----------------------------------------------------------------------------------------

//----------------------------------------draw line----------------------------------------
function onDrawingEvent(data){
  drawLine(data.x0 , data.y0 , data.x1 , data.y1 , data.color);
}

function drawLine(x0, y0, x1, y1, color, emit){
  context.lineWidth = current.lineWidth;
  context.strokeStyle = color;
  context.beginPath();
  context.moveTo(x0,y0);
  context.lineTo(x1,y1);
  context.stroke();
  context.closePath();

  if (!emit) { return; }
  var w = canvas.width;
  var h = canvas.height;

  socket.emit('drawing', {
    x0: x0 ,
    y0: y0 ,
    x1: x1 ,
    y1: y1 ,
    color: color
  });
}
//-----------------------------------------------------------------------------------------

//-------------------------to limit the number of events per second------------------------
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

//--------------------------------Resize even and function--------------------------------
window.addEventListener('resize', onResize, false);
onResize();
// make the canvas fill its parent
function onResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
//-----------------------------------------------------------------------------------------

