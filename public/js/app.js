var socket = io();
socket.on('connect',function(){
    console.log('connected to socket.io server');
});

// when 'message' socket is fired
socket.on('message', function(message){
    // var now = moment();
    // var timestamp = now.valueOf();
    var timestampMoment = moment.utc(message.timestamp).format('h:mm:ss a'); // display time in h:mm:ss am/pm format
    
    console.log('new message ' + message.text);
    
    jQuery('.messages').append('<p>' + '<b> ' + timestampMoment + ': </b>' + message.text + '</p>')
});

//handle  submitting of new message
var $form = jQuery('#message-form');

$form.on('submit', function(event){
    event.preventDefault();
    
    var $message = $form.find('input[name=message]');
    socket.emit('message', {
        text: $message.val()
    });
    
    $message.val('');
});