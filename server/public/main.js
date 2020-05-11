'use strict';


(function() {

var socket = io();

//------------------Set drawing board------------------
var canvas = document.getElementsByClassName('whiteboard')[0];
var colors = document.getElementsByClassName('color pen');
let context = canvas.getContext("2d");
let rect = canvas.getBoundingClientRect();
//-----------------------------------------------------  

socket.on('drawing', drawingEvent);


//-------------Color params and functions-------------
var current = {color: 'black', prev_color: 'black'};


for (var i = 0; i < colors.length; i++){
  colors[i].addEventListener('click', onColorUpdate, false);
}
function onColorUpdate(e){
  current.prev_color = current.color;
  current.color = e.target.style.backgroundColor;
  context.beginPath();
}
//-----------------------------------------------------

//--------------------Pen selector---------------------
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
//-----------------------------------------------------  

//-------------------Refresh screen--------------------
document.getElementsByClassName("color refresh")[0].addEventListener('click', function (e){
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.closePath();
  context.beginPath();
});
//-----------------------------------------------------  

var drawing = false;
var x_elem = 0;
var y_elem = 0;
var start = true;
var x_y_vals = 0;
var x_pass_1 = 0;
var y_pass_1 = 0;
var x_pass_2 = 0;
var y_pass_2 = 0;

// Mouse support for computer
canvas.addEventListener("mousedown", mouse_down);
canvas.addEventListener("mouseup", mouse_up); 
canvas.addEventListener("mousemove", throttle(mouse_move, 1)); 
// Touch support for mobile devicesch
canvas.addEventListener("touchstart", mouse_down);
canvas.addEventListener("touchend", mouse_up); 
canvas.addEventListener("touchmove", throttle(mouse_move, 1)); 
//--------------------------------------------------------------------------------

//----------------------mouse move event listener functions-----------------------
// mousedown event listener
function mouse_down(e){
  x_y_vals =getloc(rect, canvas);
  current.x0 = x_y_vals[0];
  current.y0 = x_y_vals[1]; 
  drawing = true;
  start = true;    
}
// mouseup event listener
function mouse_up(e) {
  if (!drawing) { return; }
  drawing = false;
}
// mousemove event listener
function mouse_move(e) {
  if (!drawing) { return; }
  x_y_vals =getloc(rect, canvas);
  current.x1 = x_y_vals[0];
  current.y1 = x_y_vals[1]; 
  drawLine(start,current.x0,current.y0,current.x1,current.y1,current.color,true);
  current.x0 = current.x1
  current.y0 = current.y1;
  start = false; 
}
//--------------------------------------------------------------------------------

//-----------------------------------draw line------------------------------------
function drawLine(start_check,x0,y0,x1,y1,color,emit){
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = 2;
  if (start_check){
  context.moveTo(x0, y0);
  }
  else{
  context.lineTo(x0, y0);    
  }
  context.lineTo(x1, y1);

  context.stroke();
  context.closePath();

  if (!emit) { return; }

  socket.emit('drawing', {
    start_check: start_check,
    x0: x0 ,
    y0: y0 ,
    x1: x1 ,
    y1: y1 ,
    color: color
  });

}
//--------------------------------------------------------------------------------

//--------------------------get location of mouse/finger--------------------------
function getloc(rect_x, canvas_x) {
  if(typeof event.touches === 'undefined'){
    // Mouse location
    x_elem = event.clientX;
    y_elem = event.clientY;  
  }
  else{
    // Touch location
    x_elem = event.touches[0].clientX;
    y_elem = event.touches[0].clientY;
  }
  const a =((x_elem - rect_x.left) / (rect_x.right - rect_x.left)) *canvas_x.width;
  const b =((y_elem - rect_x.top) / (rect_x.bottom - rect_x.top)) *canvas_x.height;
  return [a, b];
}
//--------------------------------------------------------------------------------

//----------------------------------socket event----------------------------------
function drawingEvent(data){
    x_pass_1= data.x0;
    y_pass_1= data.y0;
    x_pass_2= data.x1;
    y_pass_2= data.y0;
    drawLine(data.start_check,x_pass_1, y_pass_1, x_pass_2, y_pass_2, data.color);

}
//--------------------------------------------------------------------------------


// limit the number of events per second
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


})();
