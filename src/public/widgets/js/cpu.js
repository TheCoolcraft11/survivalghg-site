function updateCPUWidget(data) {
  document.getElementById("cpu-manufacturer").innerText = data.cpu.manufacturer;
  document.getElementById("cpu-brand").innerText = data.cpu.brand;
  document.getElementById("cpu-cores").innerText = data.cpu.cores;
  const cpuUsage = data.cpu.usage || 0;
  document.getElementById("cpu-usage-bar").style.width = `${cpuUsage}%`;
  document.getElementById("cpu-usage-bar").innerText = `${cpuUsage}%`;
}

waitForElement(
  "script-./widgets/js/systemHelper.js",
  (element) => {
    initCPU();
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

function initCPU() {
  connectWebSocket(updateCPUWidget);
}
