const socket = io();


let selectedUser = null;
const secretKey = 'my-secret-key';
const chatHistory = {};



socket.on('auth_error', (message) => {
    alert(message);
    authenticateUser();
});

socket.on('user_list', (users) => {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';

    users.forEach((user) => {
        if (user.username !== username) {
            const userItem = document.createElement('li');

            userItem.innerHTML = `
                <img src="${user.profile_picture}" alt="Profile Picture">
                <span>${user.username}</span>
            `;

            userItem.addEventListener('click', () => {
                selectedUser = user.username;
                document.getElementById('messageInput').disabled = false;
                document.getElementById('sendButton').disabled = false;
                loadChat(user.username);
            });

            userList.appendChild(userItem);
        }
    });
});

document.getElementById('sendButton').addEventListener('click', () => {
    const plaintext = document.getElementById('messageInput').value;

    if (plaintext.trim() && selectedUser) {
        const ciphertext = CryptoJS.AES.encrypt(plaintext, secretKey).toString();

        socket.emit('private_message', { to: selectedUser, message: ciphertext });

        saveMessage(selectedUser, `You: ${plaintext}`);
        addMessage(`You: ${plaintext}`, 'from-me');
        document.getElementById('messageInput').value = '';
    }
});


socket.on('private_message', ({ from, message }) => {
    const bytes = CryptoJS.AES.decrypt(message, secretKey);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);

    saveMessage(from, `${from}: ${plaintext}`);
    if (selectedUser === from) {
        addMessage(`${from}: ${plaintext}`, 'from-others');
    }
});

function addMessage(text, sender) {
    const messages = document.getElementById('messages');
    const message = document.createElement('div');
    message.classList.add('message', sender);
    message.textContent = text;
    messages.appendChild(message);
}

function loadChat(user) {
    const messages = document.getElementById('messages');
    messages.innerHTML = '';

    if (chatHistory[user]) {
        chatHistory[user].forEach(msg => addMessage(msg.text, msg.sender));
    }
}

function saveMessage(user, message) {
    if (!chatHistory[user]) {
        chatHistory[user] = [];
    }
    chatHistory[user].push({ text: message, sender: message.startsWith('You:') ? 'from-me' : 'from-others' });
}