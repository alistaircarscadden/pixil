var express = require('express');
var http    = require('http');
var socket  = require('socket.io');
var fs      = require('fs');
var app     = express();
var server  = http.Server(app);
var io      = socket(server);
var canvasData = {
        width:  40,
        height: 40,
        pixels = null
    };

// Initialize pixels to a pretty blue gradient
canvasData = new Array(dimensions.width);
for(var i = 0; i < dimensions.width; i++) {
    pixels[i] = new Array(dimensions.height);
    for(var j = 0; j < dimensions.height; j++) {
        pixels[i][j] = {
            r: 255,
            g: 255,
            b: 255
        };
    }
}

// '/public' folder contents to be accessible to anyone
app.use(express.static('public'));

// When a user hits <domain>/ send them the index file
app.get('/', function(request, response) {
    response.sendFile(__dirname + '/public/index.html');
})

// When a new socket is connected
io.on('connection', function(socket) {
    io.to(socket.id).emit('canvas', canvasData);
  
    socket.on('disconnect', function(socket) {
        console.log('A user has disconnected!');
    });
    
    socket.on('draw', function(drawing) {
        if(!validateDrawing(drawing)) return;
        pixels[drawing.x][drawing.y] = drawing.c;
        socket.broadcast.emit('draw', drawing);
    });
});

// Any unhandled exceptions thrown will be printed, for example if users input unexpected data
process.on('uncaughtException', function (err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
  console.error(err.stack);
});

server.listen(3000, function() {
    console.log('Listening on Port :3000');
});

function saveCanvas(name) {
    fs.writeFile('./saves/' + name + '.json', JSON.stringify(pixels, null, 0) , 'utf-8');
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function validateDrawing(drawing) {
    if(!isNumber(drawing.x)   ||
       !isNumber(drawing.y)   ||
       !isNumber(drawing.c.r) ||
       !isNumber(drawing.c.g) ||
       !isNumber(drawing.c.b)) {
        return false;
    }

    drawing.x   = Math.floor(drawing.x);
    drawing.y   = Math.floor(drawing.y);
    drawing.c.r = Math.floor(drawing.c.r);
    drawing.c.g = Math.floor(drawing.c.g);
    drawing.c.b = Math.floor(drawing.c.b);
       
    drawing.x   %= dimensions.width;
    drawing.x   %= dimensions.height;
    drawing.c.r %= 256;
    drawing.c.g %= 256;
    drawing.c.b %= 256;
       
    return true;
}
