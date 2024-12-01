let isBackup = false;
function connectWebSocket() {

    //socket = new WebSocket(changeUrlPort(window.location.href, 8080));
    socket = new WebSocket('ws://' + window.location.origin.replace('http://', '') + '/ws1');

    socket.onmessage = function (event) {
        if (!isBackup) {
            const outputDiv = document.getElementById('console');
            outputDiv.textContent += event.data;
            outputDiv.scrollTop = outputDiv.scrollHeight;
        }
    };

    socket.onerror = function (error) {
        console.error('WebSocket error:', error);
    };

    socket.onclose = function () {
        console.log('WebSocket connection closed. Reconnecting in 1 second...');
        setTimeout(connectWebSocket, 1000);
    };
}

async function initialize() {
    checkBackupStatus();
    connectWebSocket();
}

let wasMakingBackup = false;
function checkBackupStatus() {
    displayBackup();
    setInterval(displayBackup, 1500);
}

function displayBackup() {
    fetch('/api/backups/status', {
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
        }
    })
        .then(response => response.json())
        .then(data => {
            const consoleElement = document.getElementById('console');
            if (data.progress && data.progress !== '100%' && data.progress != 'N/A') {
                isBackup = true;
                progress = data.progress.replace('%', '');
                totalsize = ((formatString(data.size, true) / progress * 100 * 0.75).toFixed(2) + " " + formatString(data.size, false));
                consoleElement.innerHTML = `
                                   <div class="backupStatus" id="backupStatus">
                    <div class="backup-header">
                        <p class="creatingBackup">Creating Backup...</p>
                        <div class="size-info">
                            <p id="sizeInfo">Size: ${data.size}</p>
                            <p id="totalSizeInfo">Total: ${totalsize}</p>
                        </div>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar-container">
                            <!-- Spinner on the left side -->
                            <div class="spinner" id="loadingSpinner" aria-label="Loading..."></div>
                            
                            <progress class="backup-progress" id="backup-progress" value="${progress}" max="100" style="width: 100%; height: 30px;"></progress>
                            <p class="progress-percentage" id="progressPercentage">${progress}%</p>
                        </div>
                        <p class="eta" id="eta">ETA: ${data.eta}</p>
                    </div>
                </div>
                `;
                wasMakingBackup = true;
            } else if (data.progress === '100%') {
                consoleElement.innerHTML = '<p>Backup erfolgreich abgeschlossen!</p>';
                wasMakingBackup = true;
            } else {
                isBackup = false;
                if (wasMakingBackup) {
                    consoleElement.innerHTML = '';
                    wasMakingBackup = false;

                    setTimeout(connectWebSocket(), 15000);
                }
            }
        })
        .catch(err => {
            console.error('Fehler beim Abrufen des Backup-Status:', err);
        });
};


function formatString(input, numbers) {
    if (numbers) {
        let onlyNumbersAndSymbols = input.replace(/[a-zA-Z]/g, "");

        let formattedString = onlyNumbersAndSymbols.replace(/,/g, ".");

        return formattedString;
    } else {
        let onlyLetters = input.replace(/[1-9]/g, "");

        let formattedString = onlyLetters.replace(",", "");

        return formattedString;
    }
}

initialize();