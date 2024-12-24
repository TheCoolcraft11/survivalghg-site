async function loadMemoryWidget() {
    try {
        const response = await fetch('/api/info');
        const data = await response.json();
        document.getElementById('memory-total').innerText = findBestUnit(data.memory.total) || '0 B';
        document.getElementById('memory-used').innerText = findBestUnit(data.memory.used) || '0 B';

        const memoryUsage = (data.memory.used / data.memory.total) * 100;
        const memoryProgressBar = document.getElementById('memory-progress-bar');
        memoryProgressBar.style.width = `${memoryUsage.toFixed(2)}%`;
        memoryProgressBar.innerText = `${findBestUnit(data.memory.used)} / ${findBestUnit(data.memory.total)}`;
    } catch (error) {
        console.error('Error fetching Memory info:', error);
    }
}
setInterval(() => {
    loadMemoryWidget();
}, 1000);
