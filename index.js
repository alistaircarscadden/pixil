var express = require('express'),
    http    = require('http'),
    socket  = require('socket.io'),
    app     = express(),
    server  = http.Server(app),
    io      = socket(server),
    pixels = new Array(10)

for(var i = 0; i < 10; i++){
    pixels[i] = new Array(10)
    for(var j = 0; j < 10; j++){
        pixels[i][j] = 0
    }
}

app.get('/', function(request, response){
    response.sendFile(__dirname + '/index.html')
})

app.get(/\/[0-9]+/, function(request, response){
    var number = request.url.match(/\/([0-9]+)/)[1]
    var str = ''
    for(var i = 1; i <= number.length - 1; i++) {
        var a = parseInt(number.substring(0, i))
        var b = parseInt(number.substring(i, number.length))
        str += a + ' + ' + b + ' = ' + (a + b) + '<br>'
    }

    response.send('<!doctype html><head></head><body><pre>' + str + '</pre></body>')
})

app.use(express.static('public'))


io.on('connection', function(socket){
    console.log('A user has connected: ', socket.id)

    io.to(socket.id).emit('canvas', pixels)  
  
    socket.on('disconnect', function(socket){
        console.log('A user has disconnected!')
    })
    
    socket.on('draw', function(drawing){
        /* Clean input */
        drawing.x = Math.floor(drawing.x)
        drawing.y = Math.floor(drawing.y)
        drawing.c = Math.floor(drawing.c)
        drawing.x %= 10
        drawing.x %= 10
        drawing.c %= 5
        
        /* Update */
        pixels[drawing.x][drawing.y] = drawing.c
        
        /* Send update */
        socket.broadcast.emit('draw', drawing)
    })
})

server.listen(3000, function(){
    console.log('Listening on Port :3000')
})
