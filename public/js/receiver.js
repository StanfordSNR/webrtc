var socket = io.connect(window.location.origin);
var localId = document.getElementById('localId').value;
var remoteId = '0';
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
}

function handleOffer(data) {
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
