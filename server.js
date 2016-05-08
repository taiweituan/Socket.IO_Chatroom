var express = require("express");
var PORT = process.env.PORT || 8080;
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket){
    console.log('User connected via socket.io!');
    
    socket.on('message',function(message){
        console.log('message received: '+ message.text);
        
        // send message to everybody except sender himself
        // socket.broadcast.emit('message', message);
        
        // send message to everybody include sender himself
        io.emit('message', message);
    });
    
    socket.emit('message', {
        text: 'Welcome to the chat app'
    });
});

http.listen(PORT, function() {
    console.log('server listening to port: ' + PORT);
});