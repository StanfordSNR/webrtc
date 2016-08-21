var socket = io.connect(window.location.origin);
var localId = document.getElementById('localId').value;
var remoteId = '0';
var remoteVideo = document.getElementById('remoteVideo');
var localPC;

var host_url = window.location.href.split('/')[2];
var host_ip = host_url.split(':')[0];

var config = {
  iceServers: [
    {
      url: 'stun:' + host_ip + ':3478'
    }
  ]
};

function message(action, text) {
  this.from = localId;
  this.to = remoteId;
  this.action = action;
  this.text = text;
}

function handleOffer(data) {
  localPC = new RTCPeerConnection(config);

  localPC.onicecandidate = function(e) {
    if (e.candidate) {
      console.log("ICE gathering state change: " + e.target.iceGatheringState);
      socket.emit('msg', new message('ice', e.candidate));
    }
  }

  localPC.oniceconnectionstatechange = function(e) {
    console.log("ICE connection state change: " + e.target.iceConnectionState);
  }

  localPC.setRemoteDescription(data.text);
  localPC.onaddstream = gotRemoteStream;
  sendAnswer();
}

function gotRemoteStream(e) {
  remoteVideo.srcObject = e.stream;
  remoteVideo.play();
}

function sendAnswer() {
  localPC.createAnswer()
    .then(function(answer) {
      localPC.setLocalDescription(answer);
      socket.emit('msg', new message('answer', answer));
    });
}

function handleIce(data) {
  localPC.addIceCandidate(new RTCIceCandidate(data.text));
}

socket.on('connect', function() {
  socket.emit('id', localId);
  socket.emit('msg', new message('request', 'Request from receiver'));

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
