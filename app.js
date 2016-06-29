var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

var g_id = 0;
app.get('/receiver', function(req, res) {
  g_id++;
  res.render('receiver', {'localId':g_id, 'peerAddr':req.query.peerAddr});
});

app.get('/sender', function(req, res) {
  g_id++;
  res.render('sender', {'localId':g_id});
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
