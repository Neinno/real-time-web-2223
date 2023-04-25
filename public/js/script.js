let socket = io()
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


async function getRandomCountry() {
  try {
    const response = await fetch(`https://restcountries.com/v3.1/all?fields=name,flags`);
    const data = await response.json();
    const randomIndex = Math.floor(Math.random() * data.length);
    const countryName = data[randomIndex].name.common;
    const countryFlag = data[randomIndex].flags.svg;

    const flagContainer = document.getElementById("flagContainer");
    const flagImage = document.createElement("img");
    flagImage.src = countryFlag;
    flagContainer.appendChild(flagImage);
    
    return { countryName, countryFlag };

  } catch (error) {
    console.error(error);
    throw new Error('Error fetching');
  }
}

getRandomCountry().then((data) => {
  console.log(data.countryName, data.countryFlag);
});
