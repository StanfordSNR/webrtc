var socket = io.connect(window.location.origin);
var localId = document.getElementById('localId').value;
var remoteId = ''; 
var localVideo = document.getElementById('localVideo');
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
  localPC = new RTCPeerConnection(null);

  if (navigator.getUserMedia) {
    navigator.getUserMedia({video:true}, onSuccess, onFail);
  } else {
    alert('Does not support to get user media');
  }
}

function onSuccess(stream) {
  localVideo.srcObject = stream;
  localPC.addStream(stream);
  localPC.onicecandidate = function(e) {
    if (e.candidate) {
      socket.emit('msg', new message('ice', e.candidate));
    }
  }

  localPC.createOffer(offerOptions)
    .then(function(offer) {
      localOffer = offer;
      setOffer();
      socket.emit('msg', new message('offer', localOffer));
    });
}

function onFail() {
  alert('Failed to get user media!');
}

function setOffer() {
  localPC.setLocalDescription(localOffer);
}

function handleAnswer(data) {
  remoteAnswer = data.text;
  setAnswer();
}

function setAnswer() {
  localPC.setRemoteDescription(remoteAnswer);
}

function handleIce(data) {
  localPC.addIceCandidate(new RTCIceCandidate(data.text));
}

socket.on('connect', function() {
  socket.emit('id', localId);

  socket.on('msg', function(data) {
    switch (data.action) {
      case 'request':
        remoteId = data.from;
        sendOffer();
        break;
      case 'answer':
        handleAnswer(data);
        break;
      case 'ice':
        handleIce(data);
        break;
    }
  });
});

