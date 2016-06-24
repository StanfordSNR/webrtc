# webrtc
WebRTC adapted for Pantheon

### Install dependencies

```sh
$ sudo apt-get install chromium-browser
$ sudo apt-get install nodejs
```

### Build 

```sh
$ npm install
```

### Run signalling server

```sh
$ node app.js
```

### Run video sender

Download a `.y4m` video file (e.g., from [here](http://media.xiph.org/video/derf/y4m/)) and run

```sh
$ chromium-browser --app=http://localhost:3000/sender --use-fake-device-for-media-stream --use-file-for-fake-video-capture="XXX.y4m"
```

### Run video receiver

```sh
$ chromium-browser --app=http://localhost:3000/receiver
```
