document.getElementById('generate').addEventListener('click', function () {
    const length = parseInt(document.getElementById('length').value, 10);
    const useUpperCase = document.getElementById('useUpperCase').checked;
    const useNumbers = document.getElementById('useNumbers').checked;
    const useSymbols = document.getElementById('useSymbols').checked;

    const password = generateStrongPassword(length, useUpperCase, useNumbers, useSymbols);
    sessionStorage.setItem("passwordWidget-password", password);
    document.getElementById('password').value = password;
});

function generateStrongPassword(length = 12, useUpperCase = true, useNumbers = true, useSymbols = true) {
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';

    let characterPool = lowerCase;

    if (useUpperCase) characterPool += upperCase;
    if (useNumbers) characterPool += numbers;
    if (useSymbols) characterPool += symbols;

    if (characterPool.length === 0) {
        alert('Bitte wähle mindestens eine Option!');
        return '';
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characterPool.length);
        password += characterPool[randomIndex];
    }

    return password;
}
