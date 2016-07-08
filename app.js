var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var sockets = {};
var g_id = 0;

server.listen(3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

app.get('/sender', function(req, res) {
  res.render('sender', {'localId':0});
});

app.get('/receiver', function(req, res) {
  g_id++;
  res.render('receiver', {'localId':g_id, 'remoteId':0});
});

function client(socket) {
  this.socket = socket;
}

io.on('connection', function(socket) {
  socket.on('id', function(id) {
    sockets[id] = socket;
  });

  socket.on('msg', function(data) {
    sockets[data.to].emit('msg', data);
  });
});
