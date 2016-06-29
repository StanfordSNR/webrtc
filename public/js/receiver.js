var socket = io.connect('http://localhost:3000');
var localId = document.getElementById('localId').value;
var remoteId = document.getElementById('remoteId').value;

var remoteVideo = document.getElementById('remoteVideo');

var localPC;
var remoteOffer;
var localAnswer;

function message(action, text) {
  this.from = localId;
  this.to = remoteId;
  this.action = action;
  this.text = text;
}

function init() {
  localPC = new RTCPeerConnection(null);
  localPC.onaddstream = gotRemoteStream;
  localPC.onicecandidate = function(e) {
    if (e.candidate) {
      socket.emit('msg', new message('ice', e.candidate));
    }
  }
}

function gotRemoteStream(e) {
  remoteVideo.srcObject = e.stream;
  remoteVideo.play();
}

function sendRequest() {
  socket.emit('msg', new message('request', 'Request from receiver'));

  console.log('Sent request');
}

function handleOffer(data) {
  console.log('Received offer', data.text);

  remoteOffer = data.text;
  setOffer();
  sendAnswer();
}

function setOffer() {
  localPC.setRemoteDescription(remoteOffer);
}

function sendAnswer() {
  localPC.createAnswer()
    .then(function(answer) {
      localAnswer = answer;
      setAnswer();
      socket.emit('msg', new message('answer', localAnswer));

      console.log('Sent answer', answer);
    });
}

function setAnswer() {
  localPC.setLocalDescription(localAnswer);
}

function handleIce(data) {
  localPC.addIceCandidate(new RTCIceCandidate(data.text));
}

socket.on('connect', function() {
  socket.emit('id', localId);
  init();
  sendRequest();

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
