document.addEventListener('DOMContentLoaded', () => {
  let socket = io();

  let messages = document.querySelector('section ul')
  let input = document.querySelector('input')

  document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault()
    if (input.value) {
      socket.emit('message', input.value)
      input.value = ''
    }
  })

  socket.on('message', (message) => {
    addMessage(message)
  })

  socket.on('history', (history) => {
    history.forEach((message) => {
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
    messages.appendChild(Object.assign(document.createElement('li'), { textContent: message }))
    messages.scrollTop = messages.scrollHeight
  }

  socket.on('current country', (data) => {
    document.getElementById('country-flag').setAttribute('src', data.flag);
  });

});