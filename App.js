var canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");
context.beginPath();
let vert = 0
let startX =0
let startY =0
let endX =0
let endY =0
canvas.addEventListener('mousedown', function(e) {
    getCursorPosition(canvas, context, e, vert)
})

function getCursorPosition(canvas, context, event, vertex) {
	var z = vertex % 2;
	vert++;
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width
    const y = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    document.getElementById("demo").innerHTML = "x: " + x + " y: " + y;

    if (z==0){
		context.moveTo(x, y);
		startX =x;
		startY =y;
	}
    else{
		context.lineTo(x, y);
		endX =x;
		endY =y;
		//offset from point 1 to 2
		let dX = endX - startX;
		let dY = endY - startY;
		//rotate and add to point 1 to find point 3
		let x3 = (Math.cos(60) * dX - Math.sin(60) * dY) + startX;
		let y3 = (Math.sin(60) * dX + Math.cos(60) * dY) + startY;

		context.lineTo(x3, y3);
		context.closePath();
		// the outline
		context.lineWidth = 1;
		context.strokeStyle = "#666666";
		context.stroke();

		// the fill color
		context.fillStyle = "#FFCC00";
		context.fill();
}

}


function drawTriangle(startX,startY,endX,endY) {
	// var canvas = document.getElementById("canvas");
	// let context = canvas.getContext("2d");
	// // context.clearRect(0, 0, canvas.width, canvas.height);
	// // context.fillStyle = "#808080";
	// // context.fillRect(0, 0, canvas.width, canvas.height);

	context.beginPath();
	context.moveTo(startX, startY);
	context.lineTo(endX, endY);
	//offset from point 1 to 2
	let dX = endX - startX;
	let dY = endY - startY;
	//rotate and add to point 1 to find point 3
	let x3 = (Math.cos(60) * dX - Math.sin(60) * dY) + startX;
	let y3 = (Math.sin(60) * dX + Math.cos(60) * dY) + startY;

	context.lineTo(x3, y3);
	context.closePath();

	// the outline
	context.lineWidth = 1;
	context.strokeStyle = "#666666";
	context.stroke();

	// the fill color
	context.fillStyle = "#FFCC00";
	context.fill();
}