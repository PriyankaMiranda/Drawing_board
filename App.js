var canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
// context.globalCompositeOperation = 'destination-atop';
// context.strokeStyle = "rgba(1, 1, 1, 0)";
context.globalAlpha = 0.2;
context.beginPath();
let vert = 0
let startX =0
let startY =0
let endX =0
let endY =0
var hex_colors = [];
var hex_colors_copy = [];
var triangles=[];

var triangles_copy =[];

canvas.addEventListener('mousedown', function(e) {
    getCursorPosition(e)
})

function clearscreen(){
	context.clearRect(0, 0, canvas.width, canvas.height);
}

function getCursorPosition(event) {
	var z = vert % 2;
	vert++;
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width
    const y = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    document.getElementById("demo").innerHTML = "x: " + x + " y: " + y;
    draw(x,y,z)

}

function removeTriangle(hex_val) {
	index=hex_colors.indexOf(hex_val);
	for (i = index; i < triangles.length-1; i++) { 
		triangles[i]=triangles[i+1];	
		hex_colors[i]=hex_colors[i+1];
	}
	triangles.pop();
	hex_colors.pop();

	clearscreen()
	loadAllTriangles()
}

function moveTriangle(hex_val,x1,y1,x2,y2) {
	index=hex_colors.indexOf(hex_val);
	clearscreen()
	context.putImageData(triangles[index], x2-x1,y2-y1);
	context.drawImage(canvas, 0, 0);
	triangles[index]=context.getImageData(0, 0, canvas.width, canvas.height);
	clearscreen()
	loadAllTriangles()
}

function checkTriangle(){
	var data = context.getImageData(startX, startY, 1, 1).data;
	hex_val=rgb2hex(data[0],data[1],data[2]);
	var data2 = context.getImageData(endX, endY, 1, 1).data;
	hex_val2=rgb2hex(data2[0],data2[1],data2[2]);
	if(hex_colors.includes(hex_val)){
		if(hex_val==hex_val2){
			removeTriangle(hex_val);// Deleting Triangle
		}
		else{
			moveTriangle(hex_val,startX,startY,endX,endY);
		}
			return true;
	}
	else{
		return false;//returns false if the colours are not present in the array
	}
}

function rgb2hex(r,g,b){
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);

  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return "#" + r + g + b;
}
function addTriangles(){
	var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
	triangles[triangles.length] = imageData;
}

function loadAllTriangles(){
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.drawImage(canvas, 0, 0);
	var complete_picture = context.getImageData(0, 0, canvas.width, canvas.height);
	for (i = 0; i < triangles.length; i++) { 
		complete_picture=combine(complete_picture,triangles[i])
	}	
	context.putImageData(complete_picture, 0, 0);
	context.drawImage(canvas, 0, 0);
}

function combine(triangle1,triangle2){ 
    var triangle3 = triangle1;//copying triangle 1
    for (var i = 0; i < triangle1.data.length; i++) {//go through all the datapoints in triangle 1
        if(triangle2.data[i]>0){
        triangle3.data[i] = triangle2.data[i];
        }
    }
    return triangle3;
}

function draw(x,y,z){
    if (z==0){
		startX =x;
		startY =y;
		context.moveTo(x, y);
	}
    else{
		endX =x;
		endY =y;
		// check if triangle is present at the positions
		if (!checkTriangle()){
			do{
			var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
			}
			while(hex_colors.includes(randomColor));
			hex_colors[hex_colors.length] = randomColor;


			//offset from point 1 to 2
			let dX = endX - startX;
			let dY = endY - startY;
			//rotate and add to point 1 to find point 3
			let x3 = Math.round(Math.cos(60* Math.PI / 180) * dX - Math.sin(60* Math.PI / 180) * dY) + startX;
			let y3 = Math.round(Math.sin(60* Math.PI / 180) * dX + Math.cos(60* Math.PI / 180) * dY) + startY;

			clearscreen()
			context.lineToWidth = 0;
			context.strokeStyle = randomColor;
			context.globalAlpha = 1;
			context.moveTo(startX, startY);
			context.lineTo(x, y);
			context.lineTo(x3, y3);
			context.closePath();
			context.stroke();
			context.fillStyle = randomColor;
			context.fill();
			context.drawImage(canvas, 0, 0);


			addTriangles()
			loadAllTriangles()

			context = canvas.getContext("2d");
			context.beginPath();
		}
}
}

