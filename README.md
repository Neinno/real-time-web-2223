# Real-Time Web @cmda-minor-web 2022 - 2023

## Table of Contents
- [Introductie](#Introductie)


### Live site
https://real-time-web-2223-production-8652.up.railway.app/

## Introductie
Voor Real-Time web ben ik met NodeJS en sockets bezig geweest om een chat te maken. Het doel van deze opdracht is het leren van het omgaan met sockets. 

In deze opdracht ga ik een guesser game maken waarbij je de vlaggen van de wereld moet gaan raden. Doormiddel van het gebruik van Sockets kan ik een chat aanmaken, waar je dan vervolgens met meerdere mensen kan typen, en kan gaan raden welke vlag het is.

## Proces

### Starten met sockets
Voor deze opdracht ben ik eerst begonnen het met opzetten van een NodeJS applicatie. Hierbij heb ik express, en sockets geïnstalleerd. Voor het opzetten van sockets heb ik gekeken naar het voorbeeld van de website van socket.io.

- https://socket.io/get-started/chat

### API
Mijn idee is om een willekeurige vlag van de wereld te laten zien, die de gebruikers vervolgens moeten gaan raden. Hierbij heb ik deze API gevonden:

Rest countries API om de landen en hun vlaggen op te halen.
- https://restcountries.com/

De Rest Countries API bied de mogelijkheid om tijdens de fetch al minder data op te vragen. Op die manier kan ik al gaan filteren:

```js
fetch(`https://restcountries.com/v3.1/all?fields=name,flags`);
```

Dit geeft mij alleen de naam, en de bijbehorende vlag van het land terug. Dit is vervolgens wat ik terug krijg van de API:

#### Data model van API
<img src="/readmeimgs/datamodelAPI.png" height=400px>

Daarna heb ik een Data Flow Diagram gemaakt van hoe ik mijn applicatie wil gaan opzetten. 

#### Data Flow Diagram
<img src="/readmeimgs/dataflowdiagram.png" height=400px>

