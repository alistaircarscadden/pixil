var express = require('express'),
    http    = require('http'),
    socket  = require('socket.io'),
    app     = express(),
    server  = http.Server(app),
    io      = socket(server),
    dimensions = {'width': 40,
                  'height': 40}
    pixels = new Array(dimensions.width)

for(var i = 0; i < dimensions.width; i++){
    pixels[i] = new Array(dimensions.height)
    for(var j = 0; j < dimensions.height; j++){
        pixels[i][j] = {
            'r': 255,
            'g': 255,
            'b': 255
        }
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
    var time = new Date(Date.now()).toDateString()
    console.log('[' + time + '] A user has connected: ', socket.id)

    io.to(socket.id).emit('canvas', {'width': dimensions.width, 'height': dimensions.height, 'pixels': pixels})
  
    socket.on('disconnect', function(socket){
        console.log('A user has disconnected!')
    })
    
    socket.on('draw', function(drawing){
        /* Clean input */
        drawing.x = Math.floor(drawing.x)
        drawing.y = Math.floor(drawing.y)
        drawing.c.r = Math.floor(drawing.c.r)
        drawing.c.g = Math.floor(drawing.c.g)
        drawing.c.b = Math.floor(drawing.c.b)
        
        drawing.x %= dimensions.width
        drawing.x %= dimensions.height
        drawing.c.r %= 255
        drawing.c.g %= 255
        drawing.c.b %= 255
        
        /* Update */
        pixels[drawing.x][drawing.y] = drawing.c
        
        /* Send update */
        socket.broadcast.emit('draw', drawing)
    })
})

server.listen(3000, function(){
    console.log('Listening on Port :3000')
})
