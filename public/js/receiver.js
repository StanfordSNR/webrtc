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

function sendAnswer() {
  localPC.createAnswer()
    .then(function(answer) {
      localAnswer = answer;
      setAnswer();
      socket.emit('msg', new message('answer', localAnswer));

      console.log('Sent answer', answer);
    });
}

function setOffer() {
  localPC = new RTCPeerConnection(null);
  localPC.setRemoteDescription(remoteOffer);
  localPC.onaddstream = gotRemoteStream;
}

function gotRemoteStream(e) {
  remoteVideo.srcObject = e.stream;
  remoteVideo.play();
}

function setAnswer() {
  localPC.setLocalDescription(localAnswer);
}

socket.on('connect', function() {
  socket.emit('id', localId);
  sendRequest();

  socket.on('msg', function(data) {
    switch (data.action) {
      case 'offer':
        handleOffer(data);
        break;
    }
  });
});
