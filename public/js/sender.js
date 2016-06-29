var localVideo = document.getElementById('localVideo');  
var localStream;

var socket = io.connect('http://localhost:3000');
var localAddr = '10.0.0.1';
var remoteAddr; 

var localPC;
var localOffer;
var remoteAnswer;
var offerOptions = {
  offerToReceiveVideo: 1
};

function message(action, text) {
  this.from = localAddr;
  this.to = remoteAddr;
  this.action = action;
  this.text = text;
}

function sendOffer() {
  localPC = new RTCPeerConnection(null);

  localPC.onicecandidate = function(e) {
    if (e.candidate) {
      socket.emit('msg', new message('ice', e.candidate));
    }
  }

  if (navigator.getUserMedia) {
    navigator.getUserMedia({video:true}, onSuccess, onFail);
  } else {
    alert('Does not support to get user media');
  }
}

function onSuccess(stream) {
  localVideo.srcObject = stream;
  localStream = stream;
  localPC.addStream(localStream);

  localPC.createOffer(offerOptions)
    .then(function(offer) {
      console.log('Created offer', offer);
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

function setAnswer() {
  localPC.setRemoteDescription(remoteAnswer);
}

function handleHello(data) {
  if (!remoteAddr) {
    remoteAddr = data.from;
    sendOffer();
  }
}

function handleAnswer(data) {
  console.log('Received answer from receiver', data.text);
  remoteAnswer = data.text;
  setAnswer();
}

function handleIce(data) {
  localPC.addIceCandidate(new RTCIceCandidate(data.text));
}

socket.on('connect', function() {
  socket.emit('addr', localAddr);
  socket.on('msg', function(data) {
    switch (data.action) {
      case 'hello':
        handleHello(data);
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

