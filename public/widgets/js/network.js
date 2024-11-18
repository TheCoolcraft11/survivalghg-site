async function loadNetworkWidget() {
    try {
        const response = await fetch('/api/info');
        const data = await response.json();
        const networkContainer = document.getElementById('network-info-container');
        networkContainer.innerHTML = ''; // Clear previous data

        const filteredNetwork = data.network.filter(iface => iface.iface !== 'lo');
        if (filteredNetwork.length === 0) {
            networkContainer.innerHTML = '<div class="info-text">No active network interfaces found.</div>';
            return;
        }

        filteredNetwork.forEach(iface => {
            const networkElement = document.createElement('div');
            networkElement.classList.add('info-text');
            networkElement.innerHTML = `
            <strong>Interface:</strong> ${iface.iface}<br>
            <strong>MAC:</strong> ${iface.mac || 'N/A'}<br>
            <strong>IPv4:</strong> ${iface.ip || 'N/A'}<br>
            <strong>IPv6:</strong> ${iface.ip6 || 'N/A'}<br>
            <strong>Data Sent:</strong> ${bytestoMB(iface.tx_bytes) || '0 MB'} MB<br>
            <strong>Data Received:</strong> ${bytestoMB(iface.rx_bytes) || '0 MB'} MB<br>
            <strong>Upload Speed:</strong> ${iface.upload || '0 MB'} B/s<br>
            <strong>Download Speed:</strong> ${iface.download || '0 MB'} B/s
        `;
            networkContainer.appendChild(networkElement);
        });
    } catch (error) {
        console.error('Error fetchingNetwork info:', error);
    }
}

function bytestoMB(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2);
}
setInterval(() => {
    loadNetworkWidget();
}, 1000);
