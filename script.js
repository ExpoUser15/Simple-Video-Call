var peer = new Peer();

const html = document.getElementsByTagName("section");
const input = document.querySelector("input");
const send = document.getElementById("send");
const id = document.getElementById("checkId");

const localVideo = document.getElementById("localPeer");
const remoteVideo = document.getElementById("remotePeer");

const remote = document.getElementById("remote");

const audioBtn = document.getElementById("audioBtn");
const videoBtn = document.getElementById("videoBtn");

const recordBtn = document.getElementById("recordBtn");
const stopBtn = document.getElementById("stopBtn");
const snapshotBtn = document.getElementById("snapshotBtn");
const sharescreenBtn = document.getElementById("sharescreenBtn");


let localStream;
let localShareScreenStream;
let mediaRecorder;
let chunks = [];

navigator.mediaDevices.getUserMedia({ audio: false, video: true })
    .then(stream => {
        localStream = stream;
        localVideo.srcObject = stream;
        videoBtn.onclick = () => {
            if(stream.getVideoTracks()[0].enabled == true){
                stream.getVideoTracks()[0].enabled = false;
                videoBtn.textContent = "Open Camera";
            }else{
                stream.getVideoTracks()[0].enabled = true;
                videoBtn.textContent = "Close Camera";
            }
        }

        audioBtn.onclick = () => {
            if(stream.getAudioTracks()[0].enabled == true){
                stream.getAudioTracks()[0].enabled = false;
                // localVideo.muted = true;
                audioBtn.textContent = "Unmuted";
            }else{
                stream.getAudioTracks()[0].enabled = true;
                // localVideo.muted = false;
                audioBtn.textContent = "Muted";
            }
        } 

        localVideo.onloadedmetadata = () => {
            localVideo.play();
        }
        sharescreenBtn.addEventListener("click", function(){
            navigator.mediaDevices.getDisplayMedia({ audio: false, video: true })
                .then(stream1 => {
                    localVideo.srcObject = stream1;
                    console.log(stream.getVideoTracks()[0])
                    if(stream1.active){
                        localStream = stream1;
                        console.log(stream1.active)
                    }
                    stream1.getVideoTracks()[0].addEventListener("ended", function(){
                        localVideo.srcObject = stream
                        stream.getVideoTracks()[0].enabled = true;
                        localStream = stream;
                })
            });
        })
});

peer.on("open", function(id){
    console.log("Your id: ", id);
})


send.addEventListener("click", function(){
    const remotePeerId = input.value;
    const call = peer.call(remotePeerId, localStream);
    call.on("stream", stream => {
        if(stream.active){
            remoteVideo.srcObject = stream;
            remoteVideo.onloadedmetadata = () => remoteVideo.play();
        }
    })
})

peer.on("call", function(call){
    call.answer(localStream);
    call.on("stream", stream => {
        if(stream.active){
            remoteVideo.srcObject = stream;
            remoteVideo.onloadedmetadata = () => remoteVideo.play();
        }
    })
})

peer.on('disconnected', () => {
    alert('Disconnected');
});

connection.on('error', (err) => {
    alert("Error", err);
});

recordBtn.addEventListener("click", function(){
    mediaRecorder = new MediaRecorder(localStream);

    mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, {type: 'video/mp4' })
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        const urlId = url.split("/");
        a.download = urlId[3];
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    mediaRecorder.ondataavailable = event => {
        if(event.data && event.data.size > 0){
            chunks.push(event.data);
        }
    } 

    mediaRecorder.start();
    recordBtn.textContent = "Recording...";
    recordBtn.disabled = true;
    stopBtn.disabled = false;
    console.log(mediaRecorder.state)
})

stopBtn.addEventListener("click", function(){
    if(mediaRecorder.state !== "inactive"){
        mediaRecorder.stop();
        stopBtn.disabled = true;
        recordBtn.textContent = "Record";
        recordBtn.disabled = false;
        console.log(mediaRecorder.state)
    }
})

// take a snapshot
snapshotBtn.onclick = function() {
    const canvas = document.createElement("canvas");
    canvas.width = localVideo.videoWidth;
    canvas.height = localVideo.videoHeight;
    document.body.appendChild(canvas);
    canvas.getContext('2d').drawImage(localVideo, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(function(blob){
      const url = URL.createObjectURL(blob);
    
      const a = document.createElement("a");
      a.href = url;
      a.download = `${url.split("/")[3]}`;
      document.body.appendChild(a);
      a.click();
    
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
  })

  document.body.removeChild(canvas);
};