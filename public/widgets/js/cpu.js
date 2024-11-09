async function fetchCPUInfo() {
    try {
        const response = await fetch('/api/info');
        const data = await response.json();
        console.log("R: " + response + " M: " + data.cpu)
        document.getElementById('cpu-manufacturer').innerText = data.cpu.manufacturer;
        document.getElementById('cpu-brand').innerText = data.cpu.brand;
        document.getElementById('cpu-cores').innerText = data.cpu.cores;
        const cpuUsage = data.cpu.usage || 0;
        document.getElementById('cpu-usage-bar').style.width = `${cpuUsage}%`;
        document.getElementById('cpu-usage-bar').innerText = `${cpuUsage}%`;
    } catch (error) {
        console.error('Error fetching CPU info:', error);
    }
}
setInterval(() => {
    fetchCPUInfo();
}, 1000);
