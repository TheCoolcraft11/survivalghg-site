setInterval(() => {
    const currentTime = new Date().toLocaleTimeString();
    document.querySelector('.currentTime').innerText = currentTime;
}, 1000);