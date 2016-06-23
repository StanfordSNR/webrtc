var socket = io.connect('http://localhost:3000');

var localVideo = document.getElementById('localVideo');
var localStream;
var localPC;
var offerOptions = {
  offerToReceiverVideo: 1
};
var offer;
var myAddr = '10.0.0.1';
var peerAddr; 

function sendOffer() {
  if (navigator.getUserMedia) {
    navigator.getUserMedia({video:true}, onSuccess, onFail);
  } else {
    alert('Does not support getUserMedia()');
  }

  var servers = null;
  localPC = new RTCPeerConnection(servers);
}

function onSuccess(stream) {
  localVideo.srcObject = stream;
  localStream = stream;

  localPC.createOffer(
    offerOptions
  ).then(
    gotDescription
  );
}

function onFail() {
  alert('Failed to get user media!');
}

function message(text) {
  this.from = myAddr;
  this.to = peerAddr;
  this.text = text;
}

function gotDescription(description) {
  offer = description;
  setOffer();
  socket.emit('msg', new message(offer.sdp));
}

function setOffer() {
  localPC.setLocalDescription(offer);
}

socket.on('connect', function() {
  socket.emit('addr', myAddr);
  socket.on('msg', function(data) {
    if (!peerAddr) {
      peerAddr = data.from;
      sendOffer();
    } else {
      console.log('Received answer from sender', data.text);
    }
  });
});

