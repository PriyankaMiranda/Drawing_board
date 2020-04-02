function draw() {
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var context = canvas.getContext('2d');

    context.fillRect(20,20,100,100);
    context.clearRect(40,40,60,60);
    context.strokeRect(45,45,50,50);
  }
}
var startX;
var startY;
function setStartCoords(event) {
	var cX = event.clientX;
	var sX = event.screenX;
	var cY = event.clientY;
	var sY = event.screenY;
	var coords1 = "client - X: " + cX + ", Y coords: " + cY;
	startX = cX;
	startY = cY;
	var coords2 = "screen - X: " + sX + ", Y coords: " + sY;
	document.getElementById("demo").innerHTML =
		coords1 + "<br>" + coords2;
}

var endX;
var endY;
function setEndCoords(event) {
	var cX = event.clientX;
	var sX = event.screenX;
	var cY = event.clientY;
	var sY = event.screenY;
	var coords1 = "client - X: " + cX + ", Y coords: " + cY;
	endX = cX;
	endY = cY;
	var coords2 = "screen - X: " + sX + ", Y coords: " + sY;
	document.getElementById("demo").innerHTML =
		coords1 + "<br>" + coords2;
}
function showCoords(event) {
  var cX = event.clientX;
  var sX = event.screenX;
  var cY = event.clientY;
  var sY = event.screenY;
  var coords1 = "client - X: " + cX + ", Y coords: " + cY;
  var coords2 = "screen - X: " + sX + ", Y coords: " + sY;
  document.getElementById("demo").innerHTML = coords1 + "<br>" + coords2;
}

// document.getElementById("screenBox").onmousemove = findScreenCoords;