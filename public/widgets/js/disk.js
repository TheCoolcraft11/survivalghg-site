async function loadDisksWidget() {
    try {
        const response = await fetch('/api/info');
        const data = await response.json();
        const disksContainer = document.getElementById('disk-info-container');
        disksContainer.innerHTML = '';

        data.disks.forEach(disk => {
            const diskElement = document.createElement('div');
            diskElement.classList.add('info-text');
            diskElement.innerHTML = `
            <strong>${disk.mount}</strong>: ${disk.size}
            <div class="progress">
                <div class="progress-bar" style="width: ${(disk.used / disk.size * 100).toFixed(2)}%;">
                    ${findBestUnit(disk.used)} / ${findBestUnit(disk.size)}
                </div>
            </div>
        `;
            disksContainer.appendChild(diskElement);
        });
    } catch (error) {
        console.error('Error fetching Disk info:', error);
    }
}
setInterval(() => {
    loadDisksWidget();
}, 1000);
