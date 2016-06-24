var remoteVideo = document.getElementById('remoteVideo');

var socket = io.connect('http://localhost:3000');
var localAddr = '10.0.0.2';
var remoteAddr = '10.0.0.1';
var localPC;
var remoteOffer;
var localAnswer;

function message(action, text) {
  this.from = localAddr;
  this.to = remoteAddr;
  this.action = action;
  this.text = text;
}

function setOffer() {
  localPC = new RTCPeerConnection(null);
  localPC.setRemoteDescription(remoteOffer);
  localPC.onaddstream = gotRemoteStream;

  localPC.onicecandidate = function(e) {
    if (e.candidate) {
      socket.emit('msg', new message('ice', e.candidate));
    }
  }
}

function gotRemoteStream(e) {
  console.log('Got remote stream');
  remoteVideo.srcObject = e.stream;
  remoteVideo.play();
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
      socket.emit('msg', new message('answer', localAnswer));
    });
}

function handleOffer(data) {
  console.log('Received offer from sender', data.text);
  remoteOffer = data.text;
  setOffer();
  sendAnswer();
}

function handleIce(data) {
  localPC.addIceCandidate(new RTCIceCandidate(data.text));
}

socket.on('connect', function() {
  socket.emit('addr', localAddr);
  socket.emit('msg', new message('hello', 'Hello from receiver'));
  socket.on('msg', function(data) {
    switch (data.action) {
      case 'offer':
        handleOffer(data);
        break;
      case 'ice':
        handleIce(data);
        break;
    }
  });
});
