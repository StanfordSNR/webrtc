var localVideo = document.getElementById('localVideo');  
var localStream;

var socket = io.connect('http://localhost:3000');
var localAddr = '10.0.0.1';
var remoteAddr; 

var localPC;
var localOffer;
var remoteAnswer;
var offerOptions = {
  offerToReceiveVideo: 0
};

function message(text) {
  this.from = localAddr;
  this.to = remoteAddr;
  this.text = text;
}

function sendOffer() {
  var servers = null;
  localPC = new RTCPeerConnection(servers);

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
      socket.emit('msg', new message(localOffer));
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

socket.on('connect', function() {
  socket.emit('addr', localAddr);
  socket.on('msg', function(data) {
    if (!remoteAddr) {
      remoteAddr = data.from;
      sendOffer();
    } else {
      console.log('Received answer from receiver', data.text);
      remoteAnswer = data.text;
      setAnswer();
    }
  });
});

