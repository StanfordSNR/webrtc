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
  alert('Cannot find sender with peer address!');
}

function client(socket) {
  this.socket = socket;
  this.offer = '';
  this.addr = '';
}

function getAddr(description) {
  var str = description.sdp;

  var ip_patt = /o=.+ IN IP[4,6] (.+)\r\n/;
  var ip = str.match(ip_patt)[1];
  
  var port_patt = /m=video (.+) UDP/;
  var port = str.match(port_patt)[1];

  var addr = ip + ':' + port;
  
  console.log(addr);
  return addr;
}

io.on('connection', function(socket) {
  socket.on('id', function(id) {
    clients[id] = new client(socket);
  });

  socket.on('msg', function(data) {
    switch(data.action) {
      case 'offer':
        clients[data.from].offer = data;
        clients[data.from].addr = getAddr(data.text);
        break;
      case 'request':
        var offer = clients[data.to].offer;
        clients[data.from].socket.emit('msg', offer); 
        break;
      default:
        clients[data.to].socket.emit('msg', data);
    }
  });
});
