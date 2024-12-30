function updateMemoryWidget(data) {
  document.getElementById("memory-total").innerText =
    findBestUnit(data.memory.total) || "0 B";
  document.getElementById("memory-used").innerText =
    findBestUnit(data.memory.used) || "0 B";

  const memoryUsage = (data.memory.used / data.memory.total) * 100;
  const memoryProgressBar = document.getElementById("memory-progress-bar");
  memoryProgressBar.style.width = `${memoryUsage.toFixed(2)}%`;
  memoryProgressBar.innerText = `${findBestUnit(
    data.memory.used
  )} / ${findBestUnit(data.memory.total)}`;
}

waitForElement(
  "script-./widgets/js/systemHelper.js",
  (element) => {
    initMemory();
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

function initMemory() {
  connectWebSocket(updateMemoryWidget);
}
