function updateNetworkWidget(data) {
  const networkContainer = document.getElementById("network-info-container");
  networkContainer.innerHTML = "";

  const filteredNetwork = data.network.filter((iface) => iface.iface !== "lo");
  if (filteredNetwork.length === 0) {
    networkContainer.innerHTML =
      '<div class="info-text">No active network interfaces found.</div>';
    return;
  }

  filteredNetwork.forEach((iface) => {
    const networkElement = document.createElement("div");
    networkElement.classList.add("info-text");
    networkElement.innerHTML = `
        <strong>Interface:</strong> ${iface.iface}<br>
        <strong>MAC:</strong> ${iface.mac || "N/A"}<br>
        <strong>IPv4:</strong> ${iface.ip4 || "N/A"}<br>
        <strong>IPv6:</strong> <span class="ip6info">${
          iface.ip6 || "N/A"
        }</span><br>
        <strong>Data Sent:</strong> ${findBestUnit(iface.tx_bytes) || "0 B"}<br>
        <strong>Data Received:</strong> ${
          findBestUnit(iface.rx_bytes) || "0 B"
        }<br>
        <strong>Current Upload:</strong> ${
          findBestUnit(iface.upload_speed) || "0 B"
        }/s<br>
        <strong>Current Download:</strong> ${
          findBestUnit(iface.download_speed) || "0 B"
        }/s
    `;
    networkContainer.appendChild(networkElement);
  });
}

waitForElement(
  "script-./widgets/js/systemHelper.js",
  (element) => {
    initNetwork();
  },
  100,
  500
);

function waitForWebSocket(callback, interval = 100, maxAttempts = 50) {
  let attempts = 0;

  const checkExistence = () => {
    if (typeof connectWebSocket === "function") {
      callback();
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(checkExistence, interval);
    } else {
      console.error(
        "connectWebSocket function not found after maximum attempts"
      );
    }
  };

  checkExistence();
}

function initNetwork() {
  connectWebSocket(updateNetworkWidget);
}

document.getElementById('speedtest-button').addEventListener('click', function() {
  const resultElement = document.getElementById('speedtest-result');
  resultElement.innerText = 'Running speedtest...';

  fetch('/api/speedtest', {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`
    } 
  })
      .then(response => response.json())
      .then(data => {
          resultElement.innerHTML = `
          <strong class="speedtest-header">Upload:</strong> ${data.upload} MBits/s<br> <strong class="speedtest-header">Download:</strong> ${data.download} MBits/s<br><strong class="speedtest-header">Ping:</strong> ${data.ping} ms<br><strong class="speedtest-header">Distance:</strong> ${data.distance} km<br>`;
      })
      .catch(error => {
          console.error('Error running speedtest:', error);
          resultElement.innerText = 'Error running speedtest';
      });
});