/* global io */
/* global jQuery */
/* global moment */

var room = getQueryVariable('room');
var name = getQueryVariable('name') || 'Anonymous';
var socket = io();

jQuery('.room-Title').text(room);

// client connect to chatroom successfully
socket.on('connect',function(){
    console.log('connected to socket.io server');
    var queryVars = getQueryVariable('name');
    jQuery('.messages').append('<p>' + queryVars + ' has joined.</p>');
    
    // send signal to server along with client info and room name
    socket.emit('joinRoom', {
        name: name,
        room: room
    });

});

// when 'message' socket is fired 
socket.on('message', function(message){
    // var now = moment();
    // var timestamp = now.valueOf();
    
    // display time in h:mm:ss am/pm format
    var timestampMoment = moment.utc(message.timestamp).format('h:mm:ss a'); 
    var $message = jQuery('.messages');
    
    console.log('new message '  + message.text);
    $message.append('<p><b>' + message.name + ' ' + timestampMoment +': </b></p>');
    $message.append('<p>'+ message.text + '</p>');
});

//handle  submitting of new message
var $form = jQuery('#message-form');

$form.on('submit', function(event){
    event.preventDefault();
    
    var $message = $form.find('input[name=message]');
    socket.emit('message', {
        name: name,
        text: $message.val()
    });
    
    $message.val('');
});


function getQueryVariable(variable){
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for(var i = 0; i < vars.length; i++){
        var pair = vars[i].split('=');
        if(decodeURIComponent(pair[0]) == variable){
            return decodeURIComponent(pair[1]).replace(/\+/g, ' ');
        }
    }
    return undefined;
}