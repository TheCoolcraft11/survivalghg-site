setInterval(() => {
    const currentTime = new Date().toLocaleTimeString();
    document.querySelector('.currentTime').innerText = currentTime;
    if (widget) {
        console.log(widget)
    }
}, 1000);
function setVar(val) {
    widget = val;
}