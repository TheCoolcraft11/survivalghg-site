function fetchTopProcesses() {
    fetch('/top-processes')
        .then(response => response.json())
        .then(processes => {
            const processList = document.getElementById("process-list");
            processList.innerHTML = ''; // Vorherige Einträge leeren

            processes.forEach(process => {
                const listItem = document.createElement("li");

                // Erstelle eine gekürzte Version des Befehls, falls er zu lang ist
                const truncatedCommand = process.command.length > 30 ? process.command.substring(0, 30) + '...' : process.command;

                listItem.textContent = `PID: ${process.pid} | User: ${process.user} | CPU: ${process.cpu}% | RAM: ${process.mem}% | Command: ${truncatedCommand}`;

                // Erstelle ein Element für den Tooltip mit dem vollständigen Befehl
                const tooltip = document.createElement("span");
                tooltip.className = "tooltip";
                tooltip.textContent = process.command;

                // Füge den Tooltip zum Listenelement hinzu
                listItem.appendChild(tooltip);

                processList.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Prozessdaten:', error);
        });
}
fetchTopProcesses();