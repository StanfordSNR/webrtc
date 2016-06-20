var socket = io.connect('http://localhost:3000');

var myAddr = '10.0.0.1';
var peerAddr = null; 

function message(text) {
  this.from = myAddr;
  this.to = peerAddr;
  this.text = text;
}

socket.on('connect', function() {
  socket.emit('addr', myAddr);
  socket.on('msg', function(data) {
    if (!peerAddr) {
      peerAddr = data.from;
      socket.emit('msg', new message('Offer from receiver'));
    } else {
      console.log('Received answer from sender', data.text);
    }
  });
});
