var socket = io()
var colors = ['white', 'black', 'red', 'blue', 'green']
var pixels, ctx = document.getElementById('cnvs').getContext('2d')


socket.on('canvas', receivePixels)

function receivePixels(px){
    console.log('Got canvas')
    
    pixels = px
    
    for(row in pixels){
        for(col in row){
            ctx.fillStyle = colors[pixels[row][col]]
            ctx.fillRect(col * 10, row * 10, col * 10 + 10, row * 10 + 10)
        }
    }
    
    console.log(pixels)
}