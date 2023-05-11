document.addEventListener('DOMContentLoaded', () => {
  let socket = io();

  let messages = document.querySelector('section ul')
  let input = document.querySelector('input')
  let flag = document.getElementById('country-flag');
  let messageHistory = [];

  document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault()
    if (input.value) {
      if (socket.connected) {
        socket.emit('message', input.value)
        input.value = ''
      } else {
        messageHistory.push({username: socket.nickname, message: input.value});
        showOfflinePage();
      }
    }
  })

  socket.on('connect', () => {
    socket.sendBuffer.forEach((data) => {
      socket.volatile.emit(data[0], ...data.slice(1));
    });
    socket.sendBuffer = [];
  });

  socket.on('message', (message) => {
    addMessage(message)
    messageHistory.push({username: message.username, message: message.message});
  })

  socket.on('history', (history) => {
    messageHistory = history;
    messageHistory.forEach((message) => {
      addMessage(message)
    })
  })

  function username() {
      let text;
      let nickname = prompt("Name:", "");
      if (nickname == null || nickname == "") {
          text = "User cancelled the prompt.";
      } else {
          socket.emit('nickname', nickname);
      }
  }

  username();

  function addMessage(message) {
    const li = document.createElement('li');
    li.classList.add(message.username === 'Game' ? 'game-message' : 'user-message');
  
    const usernameDiv = document.createElement('div');
    usernameDiv.classList.add('message-username');
    usernameDiv.textContent = message.username;
    li.appendChild(usernameDiv);
  
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message-text');
    messageDiv.textContent = message.message;
    li.appendChild(messageDiv);
  
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  }
  
  socket.on('current country', (data) => {
    flag.setAttribute('src', data.flag);
  });

  socket.on('correct guess', (data) => {
    if (socket.connected) {
      socket.emit('get current country');
    } else {
      messageHistory.push({username: 'Game', message: `Flag has been guessed correctly`});
      showOfflinePage();
    }
  });

  function showOfflinePage() {
    const li = document.createElement('li');
    li.classList.add('offline-message');

    const systemnameDiv = document.createElement('div');
    systemnameDiv.classList.add('message-username');
    systemnameDiv.textContent = 'Server';
    li.appendChild(systemnameDiv);
  
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message-text');
    messageDiv.textContent = 'You are currently offline. Please check your internet connection.';
    li.appendChild(messageDiv);

    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  }
});