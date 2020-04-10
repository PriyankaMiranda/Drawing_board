//---------------Set palette---------------
let palette_canvas = document.getElementById("canvas2");
let ctx = palette_canvas.getContext("2d");
var img = document.getElementById("colour_palette");
var scale = Math.max(
	ctx.canvas.width / img.width,
	ctx.canvas.height / img.height
); // get the max scale to fit
var x = (ctx.canvas.width - img.width * scale) / 2;
var y = (ctx.canvas.height - img.height * scale) / 2;
ctx.drawImage(img, x, 0, img.width * scale, ctx.canvas.height);
//--------------------------------------------

//-------------Selecting color--------------
palette_canvas.addEventListener("click", function(e) {});
//--------------------------------------------

//-------------Set drawing board--------------
var canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();
//--------------------------------------------

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
// mousemove event listener
canvas.addEventListener("mousemove", function(e) {
	if (z == 0) {
		x =
			((event.clientX - rect.left) / (rect.right - rect.left)) *
			canvas.width;
		y =
			((event.clientY - rect.top) / (rect.bottom - rect.top)) *
			canvas.height;
		if (start) {
			context.moveTo(x, y);
			start = false;
		} else {
			context.lineTo(x, y);
			context.stroke();
		}
	}
});

// simple clear screen
document.getElementById("button1").addEventListener("click", function() {

	context.clearRect(0, 0, canvas.width, canvas.height);
	context.beginPath();
});

// get cursor positions and then draw
// function startCursor(rect,event){
//     const x = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
//     const y = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
//     context.moveTo(x, y);
// }

// // get cursor positions and then draw
// function continueCursor(rect,event){
//     const x = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
//     const y = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
// 	context.lineTo(x, y);
// }
// // get cursor positions and then draw
// function getCursorPosition(event){
// 	var z = vert % 2;
// 	vert++;
//     const rect = canvas.getBoundingClientRect()
//     const x = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
//     const y = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
// 	line_draw(x,y,z);

//     // draw(x,y,z)
// }

// //remove deleleted trianglels from stack
// function removeTriangle(hex_val) {
// 	index=hex_colors.indexOf(hex_val);
// 	for (i = index; i < triangles.length-1; i++) {
// 		triangles[i]=triangles[i+1];
// 		hex_colors[i]=hex_colors[i+1];
// 	}
// 	triangles.pop();
// 	hex_colors.pop();
// 	clearscreen()
// 	loadAllTriangles()
// }

// // edit triangle location in stack
// function moveTriangle(hex_val,x1,y1,x2,y2) {
// 	index=hex_colors.indexOf(hex_val);
// 	clearscreen()
// 	context.putImageData(triangles[index], x2-x1,y2-y1);
// 	context.drawImage(canvas, 0, 0);
// 	triangles[index]=context.getImageData(0, 0, canvas.width, canvas.height);
// 	clearscreen()
// 	loadAllTriangles()
// }

// // check the type of operation necessary based on the mouse clicks
// function checkTriangle(){
// 	var data = context.getImageData(startX, startY, 1, 1).data;
// 	hex_val=rgb2hex(data[0],data[1],data[2]);
// 	var data2 = context.getImageData(endX, endY, 1, 1).data;
// 	hex_val2=rgb2hex(data2[0],data2[1],data2[2]);
// 	if(hex_colors.includes(hex_val)){
// 		if(hex_val==hex_val2){
// 			removeTriangle(hex_val);// Deleting Triangle
// 		}
// 		else{
// 			moveTriangle(hex_val,startX,startY,endX,endY);// Moving the triangle
// 		}
// 			return true;
// 	}
// 	else{
// 		return false;// returns false if the colours are not present in the array
// 	}
// }

// // rgb to hex
// function rgb2hex(r,g,b){
//   r = r.toString(16);
//   g = g.toString(16);
//   b = b.toString(16);

//   if (r.length == 1)
//     r = "0" + r;
//   if (g.length == 1)
//     g = "0" + g;
//   if (b.length == 1)
//     b = "0" + b;

//   return "#" + r + g + b;
// }

// // adding new triangles to stack
// function addTriangles(){
// 	var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
// 	triangles[triangles.length] = imageData;
// }

// // loading all triangles onto canvas
// function loadAllTriangles(){
// 	context.clearRect(0, 0, canvas.width, canvas.height);
// 	context.drawImage(canvas, 0, 0);
// 	var complete_picture = context.getImageData(0, 0, canvas.width, canvas.height);
// 	for (i = 0; i < triangles.length; i++) {
// 		complete_picture=combine(complete_picture,triangles[i])
// 	}
// 	context.putImageData(complete_picture, 0, 0);
// 	context.drawImage(canvas, 0, 0);
// }

// // combining triangle stack for a complete picture
// function combine(triangle1,triangle2){
//     var triangle3 = triangle1;
//     for (var i = 0; i < triangle1.data.length; i++) {
//         if(triangle2.data[i]>0){
//         triangle3.data[i] = triangle2.data[i];
//         }
//     }
//     return triangle3;
// }

// function line_draw(x,y,z){
//     if (z==0){
// 		startX =x;
// 		startY =y;
// 		context.moveTo(x, y);
// 	}

// }

// // drawing the new triangles based on mose locations
// function draw(x,y,z){
//     if (z==0){
// 		startX =x;
// 		startY =y;
// 		context.moveTo(x, y);f`a`
// 	}
//     else{
// 		endX =x;
// 		endY =y;
// 		// check if triangle is present at the positions
// 		if (!checkTriangle()){
// 			do{
// 			var randomColor = "#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);});
// 			}
// 			while(hex_colors.includes(randomColor));
// 			hex_colors[hex_colors.length] = randomColor;

// 			let dX = endX - startX;
// 			let dY = endY - startY;
// 			//calculating the third point, assuming it is equilateral, since shape isnt specified
// 			let x3 = Math.round(Math.cos(60* Math.PI / 180) * dX - Math.sin(60* Math.PI / 180) * dY) + startX;
// 			let y3 = Math.round(Math.sin(60* Math.PI / 180) * dX + Math.cos(60* Math.PI / 180) * dY) + startY;

// 			clearscreen()
// 			context.lineToWidth = 0;
// 			context.strokeStyle = randomColor;
// 			context.globalAlpha = 1;
// 			context.moveTo(startX, startY);
// 			context.lineTo(x, y);
// 			context.lineTo(x3, y3);
// 			context.closePath();
// 			context.stroke();
// 			context.fillStyle = randomColor;
// 			context.fill();
// 			context.drawImage(canvas, 0, 0);

// 			addTriangles()
// 			loadAllTriangles()

// 			context = canvas.getContext("2d");
// 			context.beginPath();
// 		}
// }
// }
