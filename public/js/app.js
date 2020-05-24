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

    // Register new Chat Room
    const createRoom = (roomName) => {
        console.info(`Creating new room: ${roomName}`);
        webrtc.createRoom(roomName, (err, name) => {
        showChatRoom(name);
        postMessage(`${username} created chatroom`);
        });
    };

    // Join existing Chat Room
    const joinRoom = (roomName) => {
        console.log(`Joining Room: ${roomName}`);
        webrtc.joinRoom(roomName);
        showChatRoom(roomName);
        postMessage(`${username} joined chatroom`);
    };

    // Post Local Message
const postMessage = (message) => {
    const chatMessage = {
      username,
      message,
      postedOn: new Date().toLocaleString('en-GB'),
    };
    // Send to all peers
    webrtc.sendToAll('chat', chatMessage);
    // Update messages locally
    messages.push(chatMessage);
    $('#post-message').val('');
    updateChatMessages();
  };
  
  // Display Chat Interface
  const showChatRoom = (room) => {
        // Hide form
        formEl.hide();
        const html = chatTemplate({ room });
        chatEl.html(html);
        const postForm = $('form');
        // Post Message Validation Rules
        postForm.form({
            message: 'empty',
        });
        $('#post-btn').on('click', () => {
            const message = $('#post-message').val();
            postMessage(message);
        });
        $('#post-message').on('keyup', (event) => {
            if (event.keyCode === 13) {
                const message = $('#post-message').val();
                postMessage(message);
            }
        });
    };

    // Update Chat Messages
    const updateChatMessages = () => {
        const html = chatContentTemplate({ messages });
        const chatContentEl = $('#chat-content');
        chatContentEl.html(html);
        // automatically scroll downwards
        const scrollHeight = chatContentEl.prop('scrollHeight');
        chatContentEl.animate({ scrollTop: scrollHeight }, 'slow');
    };

    // Receive message from remote user
    webrtc.connection.on('message', (data) => {
    if (data.type === 'chat') {
        const message = data.payload;
        messages.push(message);
        updateChatMessages();
        }
    });
});