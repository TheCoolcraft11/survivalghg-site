let isCoinGame = true;

window.onload = function () {
    const button = document.querySelector("#toggle-btn");

    if (isCoinGame) {
        button.textContent = 'Würfeln';
    }
}

function roll() {
    const coinElement = document.getElementById('coin');
    const coinFace = document.getElementById('coin-face');
    const diceElement = document.getElementById('dice');
    const diceFace = document.getElementById('dice-face');

    if (isCoinGame) {
        coinElement.classList.add('flipping');
        setTimeout(function () {
            const coinResult = Math.random() < 0.5 ? '🪙' : '💰';
            coinFace.textContent = coinResult;
            coinElement.classList.remove('flipping');
        }, 1000);
    } else {
        diceElement.classList.add('rolling');
        setTimeout(function () {
            const diceResult = Math.floor(Math.random() * 6) + 1;
            diceFace.textContent = diceResult;
            diceElement.classList.remove('rolling');
        }, 1000);
    }
}

function toggleGame() {
    const button = document.querySelector("#toggle-btn");
    const coinContainer = document.getElementById('coin-container');
    const diceContainer = document.getElementById('dice-container');

    isCoinGame = !isCoinGame;

    if (isCoinGame) {
        button.textContent = 'Dice';
        coinContainer.style.display = 'flex';
        diceContainer.style.display = 'none';
    } else {
        button.textContent = 'Coin';
        coinContainer.style.display = 'none';
        diceContainer.style.display = 'flex';
    }
}
