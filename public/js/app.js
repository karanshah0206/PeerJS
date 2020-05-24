window.addEventListener('load', () => {
    // Chat platform
    const chatTemplate = Handlebars.compile($('#chat-template').html());
    const chatContentTemplate = Handlebars.compile($('#chat-content-template').html());
    const chatEl = $('#chat');
    const formEl = $('.form');
    const messages = [];
    let username;
    // Local Video
    const localImageEl = $('#local-image');
    const localVideoEl = $('#local-video');
    // Remote Videos
    const remoteVideoTemplate = Handlebars.compile($('#remote-video-template').html());
    const remoteVideosEl = $('#remote-videos');
    let remoteVideosCount = 0;
    // Add validation rules to Create/Join Room Form
    formEl.form({
        fields: {
            roomName: 'empty',
            username: 'empty',
        },
    });
    // Create our WebRTC connection
    const webrtc = new SimpleWebRTC({
        // the id/element dom element that will hold "our" video
        localVideoEl: 'local-video',
        // the id/element dom element that will hold remote videos
        remoteVideosEl: 'remote-videos',
        // immediately ask for camera access
        autoRequestMedia: true,
    });
    // We got access to local camera
    webrtc.on('localStream', () => {
        localImageEl.hide();
        localVideoEl.show();
    });
    // Click Handlers For Form Buttons
    $('.submit').on('click', (event) => {
        if (!formEl.form('is valid')) {
          return false;
        }
        username = $('#username').val();
        const roomName = $('#roomName').val().toLowerCase();
        if (event.target.id === 'create-btn') {
            createRoom(roomName);
        } else {
            joinRoom(roomName);
        }
        return false;
    });
});