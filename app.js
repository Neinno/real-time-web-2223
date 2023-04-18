const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const path = require('path')
const port = process.env.PORT || 3000


app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

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
    socket.on('send-nickname', (nickname) => {
        socket.nickname = nickname;
        io.emit("send-nickname", socket.nickname);
    });
});

http.listen(port, () => {
  console.log('listening on http://localhost:' + port)
})


