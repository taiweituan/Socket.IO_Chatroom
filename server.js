var express = require("express");
var PORT = process.env.PORT || 8080;
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require("moment");

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

// upon connecting to the chat room
io.on('connection', function(socket){
    console.log('User connected via socket.io!');
    
    // upon joining the chat room
    socket.on('joinRoom', function(req) {
        console.log('User "' + req.name + '" has joined the room "' + req.room + '"!');
        clientInfo[socket.id] = req;
        
        // to join a specific room
        socket.join(req.room);
        
        // broadcast to everyone except client that client has joined the chat room
        // broadcast message only to the room the client is entering to
        socket.broadcast.to(req.room).emit('message',{
            name: 'System',
            text: req.name + 'has joined!',
            timestamp: moment().valueOf()
        });
    });
    
    socket.on('message',function(message){
        console.log('message received: '+ message.text);
        
        // send message to everybody except sender himself
        // socket.broadcast.emit('message', message);
        
        // send message to everybody include sender himself
        message.timestamp = moment().valueOf();
        io.to(clientInfo[socket.id].room).emit('message', message);
    });
    
    socket.emit('message', {
        name: 'System',
        text: 'Welcome to the chat app',
        timestamp: moment().valueOf()
    });
});

http.listen(PORT, function() {
    console.log('server listening to port: ' + PORT);
});