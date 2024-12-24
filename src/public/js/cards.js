const cards = [];
document.getElementById("cardForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const setSize = parseInt(document.getElementById("setSize").value, 10);
  const cardImagesInput = document.getElementById("cardImages");
  const files = cardImagesInput.files;
  const setAll = document.getElementById("setAll").checked;

  if (setSize < 1 || isNaN(setSize)) {
    alert("Please enter a valid number of cards.");
    return;
  }

  const totalImages = files.length;
  const colors = ["red", "blue", "green", "yellow"];

  if (setAll) {
    let backgroundStyle = "";

    if (totalImages > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = function (event) {
        backgroundStyle = `background-image: url(${event.target.result}); background-size: cover; background-position: center;`;

        createAllCards(backgroundStyle, setSize);
      };

      reader.readAsDataURL(file);
    } else {
      const randomColor = colors[getRndInteger(0, colors.length)];
      backgroundStyle = `background-color: ${randomColor};`;

      createAllCards(backgroundStyle, setSize);
    }
  } else {
    let imageIndex = 0;

    for (let i = 0; i < setSize; i++) {
      const newCard = document.createElement("div");
      newCard.classList.add("card");
      newCard.id = "card" + cards.length;
      cards.push(newCard);

      if (imageIndex < totalImages) {
        const file = files[imageIndex];
        const reader = new FileReader();
        reader.onload = function (event) {
          newCard.style.backgroundImage = `url(${event.target.result})`;
          newCard.style.backgroundSize = "cover";
          newCard.style.backgroundPosition = "center";
          newCard.innerHTML = `<span class="card-number">${i + 1}</span>`;
        };
        reader.readAsDataURL(file);
        imageIndex++;
      } else {
        const randomColor = colors[getRndInteger(0, colors.length)];
        newCard.classList.add(randomColor);
        newCard.innerHTML = `<span class="card-number">${i + 1}</span>`;
      }

      document.getElementById("cards-container").appendChild(newCard);
      resetCardPositions();
    }
  }

  document.getElementById("cardImages").value = "";
  document.getElementById("setSize").value = "";
  document.getElementById("setAll").checked = false;
});

function createAllCards(backgroundStyle, setSize) {
  for (let i = 0; i < setSize; i++) {
    const newCard = document.createElement("div");
    newCard.classList.add("card");
    newCard.id = "card" + cards.length;
    cards.push(newCard);

    newCard.style = backgroundStyle;
    newCard.innerHTML = `<span class="card-number">${i + 1}</span>`;

    document.getElementById("cards-container").appendChild(newCard);
  }

  resetCardPositions();
}

function resetCardPositions() {
  const cards = document.querySelectorAll(".card");
  const totalCards = cards.length;
  const angleIncrement = 360 / totalCards;

  cards.forEach((card, index) => {
    const angle = index * angleIncrement;
    card.style.transform = `rotate(${angle}deg) translateX(200px) rotate(-${angle}deg)`;
    card.style.transition = "transform 0.5s ease-in-out";
  });
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function resetCardPositions() {
  const cards = document.querySelectorAll(".card");
  const totalCards = cards.length;
  const angleIncrement = 360 / totalCards;

  cards.forEach((card, index) => {
    const angle = index * angleIncrement;
    card.style.transform = `rotate(${angle}deg) translateX(200px) rotate(-${angle}deg)`;
    card.style.transition = "transform 0.5s ease-in-out";
  });
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function resetCardPositions() {
  const cards = document.querySelectorAll(".card");
  const totalCards = cards.length;
  const angleIncrement = 360 / totalCards;

  cards.forEach((card, index) => {
    const angle = index * angleIncrement;
    card.style.transform = `rotate(${angle}deg) translateX(200px) rotate(-${angle}deg)`;
    card.style.transition = "transform 0.5s ease-in-out";
  });
}

function resetCardPositions() {
  const cards = document.querySelectorAll(".card");
  const totalCards = cards.length;
  const angleIncrement = 360 / totalCards;

  cards.forEach((card, index) => {
    const angle = index * angleIncrement;
    card.style.transform = `rotate(${angle}deg) translateX(200px) rotate(-${angle}deg)`;
    card.style.transition = "transform 0.5s ease-in-out";
  });
}

function pickCard() {
  if (cards.length === 0) return;

  cards.forEach((card) => {
    card.classList.remove("selected");
    card.style.transition =
      "transform 2s ease-in-out, opacity 0.5s ease-in-out";
    card.style.opacity = "1";
  });

  cards.forEach((card) => {
    card.classList.add("spinning");
  });

  setTimeout(() => {
    const randomCardIndex = Math.floor(Math.random() * cards.length);
    const selectedCard = document.getElementById("card" + randomCardIndex);
    selectedCard.classList.add("selected");
    selectedCard.style.zIndex = 100;

    selectedCard.style.transform = "translateY(-100px)";
  }, 2000);
}

async function addRandom(amount) {
  const cardColors = ["red", "blue", "green", "yellow"];

  for (let i = 0; i < amount; i++) {
    const cardNumber = getRndInteger(1, 10);
    const cardColor = cardColors[getRndInteger(0, cardColors.length)];
    const newCard = document.createElement("div");
    newCard.classList.add("card", cardColor);
    newCard.id = "card" + cards.length;
    cards.push(newCard);
    newCard.innerHTML = `<span class="card-number">${cardNumber}</span>`;
    document.getElementById("cards-container").appendChild(newCard);
    resetCardPositions();

    if (i < amount - 1) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
