var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/receiver', function(req, res) {
  res.render('receiver');
});

app.get('/sender', function(req, res) {
  res.render('sender');
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
