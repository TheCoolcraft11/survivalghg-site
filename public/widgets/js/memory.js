async function loadMemoryWidget() {
    try {
        const response = await fetch('/api/info');
        const data = await response.json();
        console.log("R: " + response.memory + " M: " + data.memory.used)
        document.getElementById('memory-total').innerText = data.memory.total || '0 MB';
        document.getElementById('memory-used').innerText = data.memory.used || '0 MB';

        const memoryUsage = (parseFloat(data.memory.used.replace(' MB', '')) / parseFloat(data.memory.total.replace(' MB', ''))) * 100;
        const memoryProgressBar = document.getElementById('memory-progress-bar');
        memoryProgressBar.style.width = `${memoryUsage.toFixed(2)}%`;
        memoryProgressBar.innerText = `${data.memory.used} / ${data.memory.total}`;
    } catch (error) {
        console.error('Error fetching Memory info:', error);
    }
}
setInterval(() => {
    loadMemoryWidget();
}, 1000);
