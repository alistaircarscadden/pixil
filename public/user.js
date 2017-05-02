var socket = io(),
    canvas = document.getElementById('cnvs'),
    ctx = canvas.getContext('2d'),
    colors = ['white', 'black', 'red', 'blue', 'green'],
    pixels

canvas.addEventListener('click', function(e){
    console.log(e.clientX / 80 + '\n' + e.clientY / 80)
    
    var loc = getPixel(e)
    
    pixels[loc.x][loc.y] += 1
    
    socket.emit('draw', {
        'x': loc.x,
        'y': loc.y,
        'c': pixels[loc.x][loc.y]
        }, function(response){
            console.log(response)
        })
    
    drawCanvas()
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