# Real-Time Web @cmda-minor-web 2022 - 2023

<img src="/readmeimgs/header.png" width=800px>

## Table of Contents
- [Introductie](#Introductie)
- [Features](#Features)
- [Proces](#proces)
- [Applicatie](#applicatie)
- [How to install?](#install)
- [Checklist](#checklist)
- [Bronnen](#bronnen)


### Live site
https://real-time-web-2223-production-8652.up.railway.app/

## Introductie
Voor Real-Time web ben ik met NodeJS en sockets bezig geweest om een chat te maken. Het doel van deze opdracht is het leren van het omgaan met sockets. 

In deze opdracht ga ik een guesser game maken waarbij je de vlaggen van de wereld moet gaan raden. Doormiddel van het gebruik van Sockets kan ik een chat aanmaken, waar je dan vervolgens met meerdere mensen kan typen, en kan gaan raden welke vlag het is.

## Features
In Guess the flag kan jij tegen je vrienden spelen. Hier vind je een chat functionaliteit, en daarbij krijgt iedereen de zelfde random vlag te zien. Als iemand dit raad, krijg je weer een niewe te zien.

# How to install? <a name="install"></a>
Om dit project te instaleren op je eigen computer moet je deze repository clonen. Dit kan je doen door gebruik te maken github desktop, of gebruik te maken van je terminal en de volgende command uit te voeren.
```
git clone https://github.com/Neinno/real-time-web-2223.git
```

Daarna moet je de packages gaan installeren.
```
npm install
```

Daarna kan je je server starten
```
npm run start
```

# Proces

### Starten met sockets
Voor deze opdracht ben ik eerst begonnen het met opzetten van een NodeJS applicatie. Hierbij heb ik express, en sockets geïnstalleerd. Voor het opzetten van sockets heb ik gekeken naar het voorbeeld van de website van socket.io.

- https://socket.io/get-started/chat

## API
Mijn idee is om een willekeurige vlag van de wereld te laten zien, die de gebruikers vervolgens moeten gaan raden. Hierbij heb ik deze API gevonden:

Rest countries API om de landen en hun vlaggen op te halen.
- https://restcountries.com/

De Rest Countries API bied de mogelijkheid om tijdens de fetch al minder data op te vragen. Op die manier kan ik al gaan filteren:

```js
fetch(`https://restcountries.com/v3.1/all?fields=name,flags`);
```

Dit geeft mij alleen de naam, en de bijbehorende vlag van het land terug. Dit is vervolgens wat ik terug krijg van de API:

### Data model van API
<img src="/readmeimgs/datamodelAPI.png" width=800px>

Daarna heb ik een Data Flow Diagram gemaakt van hoe ik mijn applicatie wil gaan opzetten. Ik wil beginnen met het ophalen van de data uit de API. Dit moet dan gekoppeld worden aan de chat. Als de gebruiker op de applicatie komt krijgt hij een input waar hij zijn naam kan invullen. Daarna kan je beginnen met chatten, en je ziet een willekeurige vlag. Als het goede antwoord geraden is in de chat, zal de server een bericht geven dat de vlag goed geraden is, en een nieuwe vlag genereren. 

### Data Flow Diagram
<img src="/readmeimgs/dataflowdiagram.png" width=800px>

# Applicatie
Om met mijn applicatie te beginnen heb ik een NodeJS applicatie opgezet. Daarna heb ik express toegevoegd samen met handlebars. De volgende dependencies die ik heb toegevoegd zijn NodeFetch en Socket.io.

## Serverside
### NodeFetch
NodeFetch heb ik nodig om mijn vlaggen API op te halen. Met die informatie kan ik de vlag op het scherm laten zien, en vervolgens kijken of de gebruiker de juiste vlag heeft geraden. De fetch doe ik serverside, en laat vervolgens de data clientside weer zien. Wat ik bij de volgende code doe is dat ik ervoor zorg dat de landen opgehaald worden. Doormiddel van Math.floor kan ik een random land selecteren, en deze weer laten zien. Het enige probleem waar ik tegen aan liep is dat sommige vlaggen redelijk onbekend waren, en daarom heb ik de console.log laten staan. Op die manier kan ik in railway terug zien wat het antwoord was.

```js
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
```

### Socket.io
Socket.io gebruik ik voor mijn chat functionaliteit. Dit zorgt ervoor dat users in real-time met elkaar kunnen chatten. In mijn serverside code gebruik begin ik mijn code met een connectie maken.

```js
io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
```

Bij het maken van een connectie geef ik een console.log mee. Op die manier kan ik in mijn logs zien of een user connect, of disconnect. Als er messages gestuurd worden worden deze opgeslagen in de history. Er worden meerdere dingen opgeslagen in de history, de username en de message. 

```js
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
```

Om te kijken of de input van de user klopt, en hij dus de juist vlag heeft geraden zorg ik eerst dat alles naar lowercase word gezet. Op die manier is het niet hoofdletter gevoelig. Als het juiste antwoord geraden is vor ik de functie generateCountry uit. Deze emit de currentCountry naar alle clients, en zorgt ervoor dat iedereen de nieuwe vlag ziet. Ook geef ik een message mee die feedback geeft aan de gebruiker dat de vlag geraden is. Nicknames gebruik ik zodat de gebruiker weet met wie die praat.

## Clientside
Clientside los ik alles op wat verder te maken heeft met sockets. Hier heb ik bijvoorbeeld dingen staan zoals mijn form waar je de messages in verstuurd. Maar ook waar je je username invuld, en het aanmaken van berichten. In de clientside heb ik alles in een DOMContentLoaded event gezet. Dit zorgt ervoor dat de code uitgevoerd word als de DOM geladen is.

Met io() maken we een verbinding met sockets.
```js
let socket = io();
```

### Messages sturen
Daarna zorg ik ervoor dat je ook berichten kan sturen via het form. Als er geen connectie is laat hij een offline message zien.
```js
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
```

Daarna zorg ik ervoor dat berichten gestuurd worden. Hier geef ik het bericht, en de username van de gebruiker mee. De username geef je op als je in het begin op de pagina komt.
```js
socket.on('message', (message) => {
    addMessage(message)
    messageHistory.push({username: message.username, message: message.message});
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
```

Vervolgens append ik de het bericht aan de list die ik in de HTML heb staan.
```js
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
```

### Vlaggen update
Om de nieuwe vlag te zien en de message te krijgen dat de juist vlagen geraden is gebruik ik de volgende code:

```js
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
```

Dit zet de link van de vlag naar de juist informatie die ik uit de fetch haal die ik serverside heb gedaan. Bij een correct guess doe ik het zelfde als bij het sturen van berichten, maar deze message is altijd het zelde.

### History & Offline
Ik gebruik history om te laten zien welke messages welke messages er al eerder zijn gestuurd. Op die manier kunnen gebruiker terug kijken naar wat er al gestuurd is. De foreach loop gebruikt is om te kijken wat er allemaal in de messageHistory array zit. Vervolgens laat ik alle messages weer zien met addMessage()

```js
socket.on('history', (history) => {
    messageHistory = history;
    messageHistory.forEach((message) => {
      addMessage(message)
    })
  })
```

Om Offline te laten werken maak ik een functie aan wanneer er geen connectie is met de sockets.

```js 
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
```

Dit maake weer een zelfde bericht aan als de messages, die ervoor zorgt dat de user feedback krijgt wanneer het niet mogelijk is om een bericht te sturen.

Dit zorgt ervoor dat buffered messages worden opgeslagen. Buffered messages worden gestuurd zodra er connectie is. Als alle buffered messages zijn gestuurd word de array geleegd.
```js
socket.on('connect', () => {
    socket.sendBuffer.forEach((data) => {
      socket.volatile.emit(data[0], ...data.slice(1));
    });
    socket.sendBuffer = [];
  });
```

## Checklist
- [x] Opdracht kiezen
- [x] Met sockets een chat maken
- [x] API kiezen
- [x] Data tonen op het scherm
- [x] Mogelijk maken om het land te raden
- [x] Bericht geven als het land geraden is.
- [x] Zorgen dat de API update als het geraden is
- [x] Offline toevoegen
- [ ] Offline verbeteren (Werkt niet helemaal als je reconnect)
- [ ] Ervoor zorgen dat vlaggen raden wat makkelijker word (Erg typ gevoelig op dit moment)
- [ ] States
- [ ] Current user list
- [ ] Punten telling

# Bronnen
- [Main repository van dit vak](https://github.com/cmda-minor-web/real-time-web-2223)
- [Sockets](https://socket.io/get-started/chat)
- [API](https://restcountries.com/)