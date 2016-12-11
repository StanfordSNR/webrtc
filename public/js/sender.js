var socket = io.connect(window.location.origin);
var localId = document.getElementById('localId').value;
var remoteId = '';
var localVideo = document.getElementById('localVideo');
var localPC;
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
  localPC = new RTCPeerConnection();

  localPC.onicecandidate = function(e) {
    if (e.candidate) {
      console.log("ICE gathering state change: " + e.target.iceGatheringState);
      socket.emit('msg', new message('ice', e.candidate));
    }
  }

  localPC.oniceconnectionstatechange = function(e) {
    console.log("ICE connection state change: " + e.target.iceConnectionState);
  }

  if (navigator.getUserMedia) {
    navigator.getUserMedia({video:true}, onSuccess, onFail);
  } else {
    alert('Does not support to get user media');
  }
}

function onSuccess(stream) {
  localVideo.srcObject = stream;
  localPC.addStream(stream);

  localPC.createOffer(offerOptions)
    .then(function(offer) {
      localPC.setLocalDescription(offer);
      socket.emit('msg', new message('offer', offer));
    });
}

function onFail() {
  alert('Failed to get user media!');
}

function handleAnswer(data) {
  localPC.setRemoteDescription(data.text);
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

