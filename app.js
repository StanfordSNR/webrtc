var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);
app.use(express.static(__dirname + '/'));

app.get('/receiver', function(req, res) {
  res.sendFile(__dirname + '/receiver.html');
});

app.get('/sender', function(req, res) {
  // console.log(req.query.addr);
  res.sendFile(__dirname + '/sender.html');
});

var clients = {};

function client(socket) {
  this.socket = socket;
}

io.on('connection', function(socket) {
  socket.on('addr', function(addr) {
    clients[addr] = new client(socket);
  });

  socket.on('msg', function(data) {
    console.log(data);
    clients[data.to].socket.emit('msg', data);
  });
});
