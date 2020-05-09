'use strict';

(function() {



//-------------Set drawing board--------------
var canvas_x = document.getElementsByClassName("whiteboard")
var canvas = document.getElementsByClassName("whiteboard")[0];

let context = canvas.getContext("2d");
let rect = canvas.getBoundingClientRect();
//--------------------------------------------  

var colors = document.getElementsByClassName('color');

var current = {color: 'black', lineWidth:'3',lineShape:'round'};

for (var i = 0; i < colors.length; i++){
  colors[i].addEventListener('click', onColorUpdate, false);
}

var x = 0;
var y = 0;
var z = 1;
var start = true;
var clear = false;
// mousedown event listener
canvas.addEventListener("mousedown", function(e) {
  z = 0;
});
// mouseup event listener
canvas.addEventListener("mouseup", function(e) {
  (z = 1), (start = true);
});
// mouseout event listener
canvas.addEventListener("mouseout", function(e) {
  (z = 1), (start = true);
});
// mousemove event listener
canvas.addEventListener("mousemove", function(e) {
  context.strokeStyle = current.color;
  context.lineWidth = current.lineWidth;
  context.lineCap = current.lineShape;
  if (z == 0) {
    [x, y] = getloc(rect, canvas);
    console.log(x,y)
    if (start) {
      context.moveTo(x, y);
      start = false;
    } else {
      context.lineTo(x, y);
      context.stroke();
      // context.closePath();
    }
  }
});

//Touch support for mobile devices
canvas.addEventListener('touchstart', function(e) {
  z = 0;
});
canvas.addEventListener('touchend', function(e) {
  (z = 1), (start = true);
});
canvas.addEventListener('touchcancel', function(e) {
  (z = 1), (start = true);
});
canvas.addEventListener('touchmove', function(e) {
  context.strokeStyle = current.color;
  context.lineWidth = current.lineWidth;
  context.lineCap = current.lineShape;
  if (z == 0) {
    [x, y] = getloc(rect, canvas);
    if (start) {
      context.moveTo(x, y);
      start = false;
    } else {
      context.lineTo(x, y);
      context.stroke();
      // context.closePath();
    }
  }
});







  function onColorUpdate(e){
    current.color = e.target.className.split(' ')[1];
  }


function getloc(rect_x, canvas_x) {
  var x_val = 0;
  var y_val = 0;
  try {
  x_val= event.touches[0].clientX;
  y_val= event.touches[0].clientY;
  }
  catch(err) {
  x_val=event.clientX;
  y_val=event.clientY;
  }
  const a =((x_val - rect_x.left) / (rect_x.right - rect_x.left)) *canvas_x.width;
  const b =((y_val - rect_x.top) / (rect_x.bottom - rect_x.top)) *canvas_x.height;
  return [a, b];
} 














  // var socket = io();




  // var drawing = false;

  // canvas.addEventListener('mousedown', onMouseDown, false);
  // canvas.addEventListener('mouseup', onMouseUp, false);
  // canvas.addEventListener('mouseout', onMouseUp, false);
  // canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
  
  // //Touch support for mobile devices
  // canvas.addEventListener('touchstart', onMouseDown, false);
  // canvas.addEventListener('touchend', onMouseUp, false);
  // canvas.addEventListener('touchcancel', onMouseUp, false);
  // canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);


  // socket.on('drawing', onDrawingEvent);

  // window.addEventListener('resize', onResize, false);
  // onResize();


  // function drawLine(x0, y0, x1, y1, color, emit){
  //   context.beginPath();
  //   context.moveTo(x0, y0);
  //   context.lineTo(x1, y1);
  //   context.strokeStyle = color;
  //   context.lineWidth = 2;
  //   context.stroke();
  //   context.closePath();

  //   if (!emit) { return; }
  //   var w = canvas.width;
  //   var h = canvas.height;

  //   socket.emit('drawing', {
  //     x0: x0 / w,
  //     y0: y0 / h,
  //     x1: x1 / w,
  //     y1: y1 / h,
  //     color: color
  //   });
  // }

  // function onMouseDown(e){
  //   drawing = true;
  //   current.x = e.clientX||e.touches[0].clientX;
  //   current.y = e.clientY||e.touches[0].clientY;
  // }

  // function onMouseUp(e){
  //   if (!drawing) { return; }
  //   drawing = false;
  //   var a=((current.x-rect.left)/(rect.right-rect.left))*canvas.width;
  //   console.log(current.x)
  //   console.log(a)
  //   console.log("----------")
  //   // x1=((e.clientX - rect.left) / (rect.right - rect.left)) *canvas.width;
  //   // y0=((current.y - rect.top) / (rect.bottom - rect.top)) *canvas.height;
  //   // y1=((e.clientY - rect.top) / (rect.bottom - rect.top)) *canvas.height;
  //   // drawLine(x0, y0, x1, x2, current.color, true);
  //   drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true);
  // }

  // function onMouseMove(e){
  //   if (!drawing) { return; }
    
  //   // x0=((current.x - rect.left) / (rect.right - rect.left)) *canvas.width;
  //   // x1=((e.clientX - rect.left) / (rect.right - rect.left)) *canvas.width;
  //   // y0=((current.y - rect.top) / (rect.bottom - rect.top)) *canvas.height;
  //   // y1=((e.clientY - rect.top) / (rect.bottom - rect.top)) *canvas.height;
  //   // drawLine(x0, y0, x1, x2, current.color, true);




  //   drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true);
  //   current.x = e.clientX||e.touches[0].clientX;
  //   current.y = e.clientY||e.touches[0].clientY;
  // }

  // // limit the number of events per second
  // function throttle(callback, delay) {
  //   var previousCall = new Date().getTime();
  //   return function() {
  //     var time = new Date().getTime();

  //     if ((time - previousCall) >= delay) {
  //       previousCall = time;
  //       callback.apply(null, arguments);
  //     }
  //   };
  // }

  // function onDrawingEvent(data){
  //   var w = canvas.width;
  //   var h = canvas.height;
  //   elem_x0=((data.x0 - rect.left) / (rect.right - rect.left)) * w;
  //   elem_x1=((data.x1 - rect.left) / (rect.right - rect.left)) * w;
  //   elem_y0=((data.y0 - rect.top) / (rect.bottom - rect.top)) *h;
  //   elem_y1=((data.y1 - rect.top) / (rect.bottom - rect.top)) *h;
  //   drawLine( elem_x0, elem_y0, elem_x1, elem_y1, data.color);
  // }


  //   // make the canvas fill its parent
  //   function onResize() {
  //     canvas.width = window.innerWidth;
  //     canvas.height = window.innerHeight;
  //   }

})();