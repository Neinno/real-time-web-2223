const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const path = require('path')
const port = process.env.PORT || 3000
const fetch = require('node-fetch');


app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

http.listen(port, () => {
  console.log('listening on http://localhost:' + port)
})

const historySize = 50
let history = []

// Serveer client-side bestanden
app.use(express.static(path.resolve('public')))

io.on('connection', (socket) => {
  console.log('a user connected')
  io.emit('history', history)

  socket.on('message', (message) => {
    while (history.length > historySize) {
      history.shift()
    }
    history.push(message)

    io.emit('message', socket.nickname + ": " + message);
  })

  socket.on('disconnect', () => {
    console.log('user disconnected')
  })
})

io.on('connection', (socket) => {
    socket.on('nickname', (nickname) => {
        socket.nickname = nickname;
        io.emit("nickname", socket.nickname);
    });
});


fetch("https://restcountries.com/v3.1/all?fields=name,flags")
  .then(async response => {
    const data = await response.json();
    console.log(data)
  })
  .catch(error => {
    console.error(error);
    res.status(500).send('Error fetching');
});


