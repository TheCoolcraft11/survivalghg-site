function fetchTopProcesses() {
    fetch('/api/top-processes')
        .then(response => response.json())
        .then(processes => {
            const processList = document.getElementById("process-list");
            processList.innerHTML = '';

            processes.forEach(process => {
                const listItem = document.createElement("li");
                listItem.classList.add('process-list');

                const truncatedCommand = process.command.length > 30 ? process.command.substring(0, 30) + '...' : process.command;

                listItem.textContent = `PID: ${process.pid} | User: ${process.user} | CPU: ${process.cpu}% | RAM: ${process.mem}% | Command: ${truncatedCommand}`;

                const tooltip = document.createElement("span");
                tooltip.className = "tooltip";
                tooltip.textContent = process.command;

                listItem.appendChild(tooltip);

                processList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Prozessdaten:', error);
        });
}
fetchTopProcesses();