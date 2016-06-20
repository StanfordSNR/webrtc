var socket = io.connect('http://localhost:3000');

var myAddr = '10.0.0.2';
var peerAddr = '10.0.0.1';

function message(text) {
  this.from = myAddr;
  this.to = peerAddr;
  this.text = text;
}

socket.on('connect', function() {
  socket.emit('addr', myAddr);
  socket.emit('msg', new message('Request from sender'));
  socket.on('msg', function(data) {
    console.log('Received offer from receiver', data.text);
    socket.emit('msg', new message('Answer from sender')); 
  });
});
