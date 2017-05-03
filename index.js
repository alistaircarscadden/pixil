var express = require('express'),
    http    = require('http'),
    socket  = require('socket.io'),
    fs      = require('fs'),
    app     = express(),
    server  = http.Server(app),
    io      = socket(server),
    dimensions = {'width': 40,
                  'height': 40}
    pixels = new Array(dimensions.width)

// Initialize pixels to a pretty blue gradient
for(var i = 0; i < dimensions.width; i++){
    pixels[i] = new Array(dimensions.height)
    for(var j = 0; j < dimensions.height; j++){
        pixels[i][j] = {
            'r': Math.floor(155 + 100*(j/dimensions.height)),
            'g': Math.floor(155 + 100*(j/dimensions.height)),
            'b': 255
        }
    }
}

// '/public' folder contents to be accessible to anyone
app.use(express.static('public'))

// When a user hits <domain>/ send them the index file
app.get('/', function(request, response){
    response.sendFile(__dirname + '/public/index.html')
})

// When a new socket is connected
io.on('connection', function(socket){
    console.log('A user has connected!')

    io.to(socket.id).emit('canvas', {'width': dimensions.width, 'height': dimensions.height, 'pixels': pixels})
  
    socket.on('disconnect', function(socket){
        console.log('A user has disconnected!')
    })
    
    socket.on('draw', function(drawing){
        /* Clean input */
        if(!isNumber(drawing.x) || !isNumber(drawing.y) || !isNumber(drawing.c.r) || !isNumber(drawing.c.g) || !isNumber(drawing.c.b)){
            return;
        }

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

// Any unhandled exceptions thrown will be printed, for example if users input unexpected data
process.on('uncaughtException', function (err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message)
  console.error(err.stack)
})

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

server.listen(3000, function(){
    console.log('Listening on Port :3000')
})

function saveCanvas(name) {
    fs.writeFile('./saves/' + name + '.json', JSON.stringify(pixels, null, 0) , 'utf-8')
}