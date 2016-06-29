var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var clients = {};
var g_id = 0;

server.listen(3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

app.get('/receiver', function(req, res) {
  g_id++;
  res.render('receiver', {'localId':g_id, 
    'remoteId':getIdByAddr(req.query.peerAddr)});
});

app.get('/sender', function(req, res) {
  g_id++;
  res.render('sender', {'localId':g_id});
});

function getIdByAddr(addr) {
  for (var id in clients) {
    if (clients[id].addr === addr)
      return id;
  }
}

function client(socket) {
  this.socket = socket;
  this.offer = '';
  this.addr = '';
}

function getAddr(description) {
  console.log('Got an offer from 10.0.0.1:2222');
  return '10.0.0.1:2222';
}

io.on('connection', function(socket) {
  socket.on('id', function(id) {
    clients[id] = new client(socket);
  });

  socket.on('msg', function(data) {
    console.log(data);

    if (data.action === 'offer') {
      clients[data.from].offer = data;
      clients[data.from].addr = getAddr(data.text);
    } else if (data.action === 'request') {
      var offer = clients[data.to].offer;
      clients[data.from].socket.emit('msg', offer); 
    } else {
      clients[data.to].socket.emit('msg', data);
    }
  });
});
