function updateDiskWidget(data) {
  const disksContainer = document.getElementById("disk-info-container");
  disksContainer.innerHTML = "";

  data.disks.forEach((disk) => {
    const diskElement = document.createElement("div");
    diskElement.classList.add("info-text");
    diskElement.innerHTML = `
        <strong>${disk.mount}</strong>: ${findBestUnit(disk.size)}
        <div class="progress">
            <div class="progress-bar" style="width: ${(
              (disk.used / disk.size) *
              100
            ).toFixed(2)}%;">
                ${findBestUnit(disk.used)} / ${findBestUnit(disk.size)}
            </div>
        </div>
    `;
    disksContainer.appendChild(diskElement);
  });
}

waitForElement(
  "script-./widgets/js/systemHelper.js",
  (element) => {
    initDisk();
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

waitForWebSocket(() => {
  initDisk();
});

function initDisk() {
  connectWebSocket(updateDiskWidget);
}
