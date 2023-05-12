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

const { engine } = require("express-handlebars");
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

const historySize = 50
let history = []

// Serveer client-side bestanden
app.use(express.static(path.resolve('public')))

const fetchJson = async (url) => {
  return await fetch(url)
    .then((response) => response.json())
    .then((body) => {
      const countries = body.map(({ name, flags }) => ({ name: name.common, flag: flags.svg }));
      return countries;
    })
    .catch((error) => error);
};

let currentCountry = null;

const generateCountry = async () => {
  const countries = await fetchJson(`https://restcountries.com/v3.1/all?fields=name,flags`);
  const randomIndex = Math.floor(Math.random() * countries.length);
  currentCountry = countries[randomIndex];
  console.log(`Generated country: ${currentCountry.name}`);
};

generateCountry();

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.emit('current country', currentCountry);
  socket.emit('history', history);

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('message', (message) => {
    while (history.length > historySize) {
      history.shift();
    }
    history.push({username: socket.nickname, message: message});

    io.emit('message', {username: socket.nickname, message: message});
    
    // check if message matches current country
    if (message.toLowerCase() === currentCountry.name.toLowerCase()) {
      generateCountry().then(() => {
        io.emit('current country', currentCountry);
        const correctGuessMessage = {username: 'Game', message: `Flag has been guessed correctly`};
        io.emit('message', correctGuessMessage);
        history.push(correctGuessMessage);
      });
    }
  });

  socket.on('nickname', (nickname) => {
    socket.nickname = nickname;
    io.emit('nickname', socket.nickname);
  });
});

app.get('/', (req, res) => {
  res.render('home', {
    name: currentCountry.name,
    flag: currentCountry.flag,
    history: history
  });
});




