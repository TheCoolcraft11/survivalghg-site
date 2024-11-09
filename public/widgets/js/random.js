function generateRandomNumber() {
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    document.querySelector('.randomNumber').innerText = randomNumber;
}
