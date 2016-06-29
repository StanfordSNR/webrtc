var socket = io.connect('http://localhost:3000');
var localId = document.getElementById('localId').value;
var remoteId = ''; 

var localStream;

var localPC;
var localOffer;
var remoteAnswer;
var offerOptions = {
  offerToReceiveVideo: 1
};

function message(action, text) {
  this.from = localId;
  this.to = remoteId;
  this.action = action;
  this.text = text;
}

function sendOffer() {
  if (navigator.getUserMedia) {
    navigator.getUserMedia({video:true}, onSuccess, onFail);
  } else {
    alert('Does not support to get user media');
  }
}

function onSuccess(stream) {
  localVideo.srcObject = stream;
  localStream = stream;

  localPC = new RTCPeerConnection(null);
  localPC.addStream(localStream);

  localPC.createOffer(offerOptions)
    .then(function(offer) {
      localOffer = offer;
      setOffer();
      socket.emit('msg', new message('offer', localOffer));

      console.log('Sent offer', offer);
    });
}

function onFail() {
  alert('Failed to get user media!');
}

function setOffer() {
  localPC.setLocalDescription(localOffer);
}

function handleAnswer(data) {
  console.log('Received answer', data.text);
  remoteId = data.from;
  remoteAnswer = data.text;
  setAnswer();
}

function setAnswer() {
  localPC.setRemoteDescription(remoteAnswer);
}

socket.on('connect', function() {
  socket.emit('id', localId);
  sendOffer();

  socket.on('msg', function(data) {
    switch (data.action) {
      case 'answer':
        handleAnswer(data);
        break;
    }
  });
});

