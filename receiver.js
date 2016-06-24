var remoteVideo = document.getElementById('remoteVideo');

var socket = io.connect('http://localhost:3000');
var localAddr = '10.0.0.2';    
var remoteAddr = '10.0.0.1';   
var localPC;                   
var remoteOffer;               
var localAnswer;               

function message(text) {       
  this.from = localAddr;       
  this.to = remoteAddr;        
  this.text = text;            
}

function setOffer() {
  var servers = null;
  localPC = new RTCPeerConnection(servers);
  localPC.setRemoteDescription(remoteOffer);
  localPC.onaddstream = gotRemoteStream;
}

function gotRemoteStream(e) {
  console.log('Got remote stream');
  remoteVideo.srcObject = e.stream;
}

function setAnswer() {
  localPC.setLocalDescription(localAnswer);
}

function sendAnswer() {
  localPC.createAnswer()
    .then(function(answer) {
      console.log('Created answer', answer);
      localAnswer = answer;
      setAnswer();
      socket.emit('msg', new message(localAnswer));
    });
}

socket.on('connect', function() {
  socket.emit('addr', localAddr);
  socket.emit('msg', new message('Request from receiver'));
  socket.on('msg', function(data) {
    console.log('Received offer from sender', data.text);
    remoteOffer = data.text;
    setOffer();
    sendAnswer();
  });
});
