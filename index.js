var express = require('express'),
    http    = require('http'),
    socket  = require('socket.io'),
    app     = express(),
    server  = http.Server(app),
    io      = socket(server)
    
var pixels = new Array(10)

for(var i = 0; i < 10; i++){
    pixels[i] = new Array(10)
    for(var j = 0; j < 10; j++){
        pixels[i][j] = 1
    }
}

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
})

app.use(express.static('public'))


io.on('connection', function(socket){
    console.log('A user has connected: ', socket.id)
    
    console.log('Sent canvas to ' + socket.id)
    io.to(socket.id).emit('canvas', pixels)  
  
    socket.on('disconnect', function(socket){
        console.log('A user has disconnected!')
    })
})

server.listen(3000, function(){
    console.log('Listening on Port :3000')
})
