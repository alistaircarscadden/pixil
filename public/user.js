var socket = io()

var canvas = document.getElementById('cnvs')
var ctx = canvas.getContext('2d')

var colors = ['white', 'black', 'red', 'blue', 'green']
var pixels

canvas.addEventListener('click', function(e){
    console.log(e.clientX / 80 + '\n' + e.clientY / 80)
    
    var loc = getPixel(e)
    
    pixels[loc.x][loc.y] = 0
    
    drawCanvas()
    
    socket.emit('draw', {'x': x, 'y': y, 'c': 0})
})

socket.on('canvas', function(px){
    pixels = px
    drawCanvas()
})

socket.on('draw', function(drawing){
    pixels[drawing.x][drawing.y] = drawing.c
    drawCanvas()
})

function drawCanvas(){
    for(var x = 0; x < 10; x++){
        for(var y = 0; y < 10; y++){
            ctx.fillStyle = colors[pixels[x][y]]
            ctx.fillRect(x * 80, y * 80, 80, 80)
        }
    }
}

function getPixel(e) {
    var rect = canvas.getBoundingClientRect()
    return {
      x: Math.floor((e.clientX - rect.left) / 80) % 10,
      y: Math.floor((e.clientY - rect.top) / 80) % 10
    }
}