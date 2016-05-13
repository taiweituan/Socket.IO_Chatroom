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
    console.log('An user has connected via socket.io!');
    
    // send message whe a client disconnect from chatroom
    socket.on('disconnect', function(req) {
        var userData = clientInfo[socket.id];

        if (typeof userData !== 'undefined'){
            socket.leave(userData.room);
            io.to(userData.room).emit('message', {
                name: 'SYSTEM',
                text: '[' + userData.name + '] has left the chatroom!',
                timestamp: moment().valueOf()
            });
            
            // delete client info 
            delete clientInfo[socket.id];
            console.log('[' + userData.name + '] has left the chatroom!');
        }
    });
    
    // upon joining the chat room
    socket.on('joinRoom', function(req) {
        console.log('User [' + req.name + '] has joined the room [' + req.room + ']!');
        clientInfo[socket.id] = req;
        
        // to join a specific room
        socket.join(req.room);
        
        // broadcast to everyone except client that client has joined the chat room
        // broadcast message only to the room the client is entering to
        socket.broadcast.to(req.room).emit('message',{
            name: 'SYSTEM',
            text: '[' + req.name + '] has joined!',
            timestamp: moment().valueOf()
        });
    });
    
    socket.on('message',function(message){
        console.log('User ['+clientInfo[socket.id].name+  '] said: "'+ message.text +'"');
        
        if (message.text === '@currentUsers'){
            sendCurrentUsers(socket);
        } else{
            // send message to everybody include sender himself
            message.timestamp = moment().valueOf();
            io.to(clientInfo[socket.id].room).emit('message', message);
        }
        
        // send message to everybody except sender himself
        // socket.broadcast.emit('message', message);
        
    });
    
    socket.emit('message', {
        name: 'SYSTEM',
        text: 'Welcome to the chat app',
        timestamp: moment().valueOf()
    });
});

http.listen(PORT, function() {
    console.log('server listening to port: ' + PORT);
});



// send current user to provided socket
function sendCurrentUsers(socket) {
    var info = clientInfo[socket.id];
    var users = [];
    
    if(typeof info === 'undefined'){
        return;
    }
    
    Object.keys(clientInfo).forEach(function(socketId){
        var userInfo = clientInfo[socketId];
        
        if(info.room === userInfo.room){
            users.push(userInfo.name);
        }
    });
    
    socket.emit('message',{
        name:'SYSTEM',
        text:'Current users: ' + users.join(', '),
        timestamp: moment.valueOf()
    });
}