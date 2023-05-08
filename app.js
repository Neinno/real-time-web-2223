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

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.emit('current country', currentCountry);
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('get new country', () => {
    getCountry().then((data) => {
      currentCountry = data;
      io.emit('new country', currentCountry);
    });
  });
});

let currentCountry = null;

const getCountry = async () => {
  return fetchJson(`https://restcountries.com/v3.1/all?fields=name,flags`)
    .then((data) => {
      const randomIndex = Math.floor(Math.random() * data.length);
      return data[randomIndex];
    });
};

const fetchJson = async (url) => {
  return await fetch(url)
    .then((response) => response.json())
    .then((body) => {
      const countries = body.map(({ name, flags }) => ({ name: name.common, flag: flags.svg }));
      return countries;
    })
    .catch((error) => error);
};

app.get('/', (req, res) => {
  getCountry().then((data) => {
    currentCountry = data;
    res.render('home', {
      name: data.name,
      flag: data.flag,
    });
    io.emit('new country', currentCountry);
  });
});

