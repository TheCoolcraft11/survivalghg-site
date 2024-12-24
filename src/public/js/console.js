const token = sessionStorage.getItem("authToken");

function hideMessageType() {
  addFilter(clickedElement.dataset.type, false);
  document.getElementById(
    `filter-${clickedElement.dataset.type}`
  ).checked = false;
}

const filterButton = document.getElementById("filter-toggle-button");
const filterDropdown = document.getElementById("filter-dropdown");
filterButton.addEventListener("click", () => {
  filterDropdown.classList.toggle("filter-show");
});
function jumpToMessage(message) {
  filterTypes = [
    "all",
    "joinorleft",
    "cmdexec",
    "deathmsg",
    "warn",
    "error",
    "info",
    "chatmsg",
    "other",
  ];

  filterMessages();
  document.querySelectorAll(".filter-checkbox").forEach((checkbox) => {
    checkbox.checked = true;
  });

  message.classList.add("jumped-message");

  window.location.hash = message.id;

  setTimeout(() => {
    message.classList.remove("jumped-message");
  }, 4000);
}

document.addEventListener("click", (event) => {
  if (
    !filterButton.contains(event.target) &&
    !filterDropdown.contains(event.target)
  ) {
    filterDropdown.classList.remove("filter-show");
  }
});

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function hideActions() {
  const actionsDiv = document.getElementById("serverLinks");
  const actionsText = document.getElementById("serverText");
  if (actionsDiv.style.display != "none") {
    actionsDiv.style.display = "none";
    actionsText.style.display = "block";
  } else {
    actionsDiv.style.display = "block";
    actionsText.style.display = "none";
  }
}

function sendCommand(event) {
  event.preventDefault();

  const commandInput = document.querySelector('input[name="command"]');
  const command = commandInput.value;
  const token = sessionStorage.getItem("authToken");
  if (token) {
    fetch("/api/mc/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body: `command=${encodeURIComponent(command)}`,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.message || "An unknown error occurred");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.type == "Not Running") {
          alert("Server is currently not running");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => {
        commandInput.value = "";
      });
  } else {
    alert("You need to be logged in to do that!");
    commandInput.value = "";
  }
}

async function initialize() {
  try {
    checkBackupStatus();
    connectWebSocket();
  } catch (error) {
    console.error("Fehler beim Initialisieren:", error);
  }
}

window.onload = initialize;

document.getElementById("btn-start").addEventListener("click", async (e) => {
  fetch("/api/mc/start", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).then(() => {
    setTimeout(connectWebSocket(), 2000);
  });
});

document.getElementById("btn-stop").addEventListener("click", async (e) => {
  const token = sessionStorage.getItem("authToken");
  if (token) {
    fetch("/api/mc/stop", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.message || "An unknown error occurred");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.type == "Not Running") {
          alert("Server is currently not running");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => {
        commandInput.value = "";
      });
  } else {
    alert("You need to be logged in to do that!");
    commandInput.value = "";
  }
});

document.getElementById("btn-restart").addEventListener("click", async (e) => {
  const token = sessionStorage.getItem("authToken");
  if (token) {
    fetch("/api/mc/restart", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.message || "An unknown error occurred");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.type == "Not Running") {
          alert("Server is currently not running");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => {
        commandInput.value = "";
      });
  } else {
    alert("You need to be logged in to do that!");
    commandInput.value = "";
  }
});
document.getElementById("btn-restart").addEventListener("click", async (e) => {
  const token = sessionStorage.getItem("authToken");
  if (token) {
    fetch("/api/mc/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body: `command=restart`,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.message || "An unknown error occurred");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.type == "Not Running") {
          alert("Server is currently not running");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => {
        commandInput.value = "";
      });
  } else {
    alert("You need to be logged in to do that!");
    commandInput.value = "";
  }
});
document.getElementById("btn-kill").addEventListener("click", async (e) => {
  const token = sessionStorage.getItem("authToken");
  if (token) {
    fetch("/api/mc/kill", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Bearer ${token}`,
      },
      body: `command=restart`,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.message || "An unknown error occurred");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.type == "Not Running") {
          alert("Server is currently not running");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      })
      .finally(() => {
        commandInput.value = "";
      });
  } else {
    alert("You need to be logged in to do that!");
    commandInput.value = "";
  }
});

const iframe = document.getElementById("bluemap-iframe");

let wasMakingBackup = false;
function checkBackupStatus() {
  displayBackup();
  setInterval(displayBackup, 151100);
}

function displayBackup() {
  fetch("/api/backups/status", {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const consoleElement = document.getElementById("console");
      const commandInput = document.querySelector('input[name="command"]');
      if (data.progress && data.progress !== "100%" && data.progress != "N/A") {
        isBackup = true;
        progress = data.progress.replace("%", "");
        totalsize =
          ((formatString(data.size, true) / progress) * 100 * 0.75).toFixed(2) +
          " " +
          formatString(data.size, false);
        commandInput.disabled = true;
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
                    
                        <p>I dont know what could be here</p>
                    </div>
                    `;
        wasMakingBackup = true;
      } else if (data.progress === "100%") {
        consoleElement.innerHTML = "<p>Backup erfolgreich abgeschlossen!</p>";
        wasMakingBackup = true;
      } else {
        isBackup = false;
        if (wasMakingBackup) {
          consoleElement.innerHTML = "";
          wasMakingBackup = false;
          commandInput.disabled = false;

          setTimeout(connectWebSocket(), 1500);
        }
      }
    })
    .catch((err) => {
      console.error("Fehler beim Abrufen des Backup-Status:", err);
    });
}

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

function openIframeInNewTab() {
  var iframe = document.getElementById("bluemap-iframe");
  var iframeSrc = iframe.src;
  window.open(iframeSrc, "_blank");
}

document.addEventListener("fullscreenchange", function () {
  if (document.fullscreenElement === iframe) {
    openIframeInNewTab();
  }
});
function backups() {
  window.location.href = "/backups.html";
}

const regexList = {
  chatRegex:
    /[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?.*\[.*\].*<[\w\s\S]+>\s+[\w\s\S]+/i,
  warnRegex: /[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?.*(WARN|WARNING)/i,
  errorRegex: /[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?.*(ERR|ERROR)/i,
  infoRegex: /[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?.*(INFO)/i,
  joinRegex:
    /\[[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?\] \[[^\]]+\]: (\[[^\]]*\] )?[\w\s\S]+(\s\[[^\]]*\])? joined the game/i,
  leftRegex:
    /\[[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?\] \[[^\]]+\]: (\[[^\]]*\] )?[\w\s\S]+(\s\[[^\]]*\])? left the game/i,
  commandRegex:
    /\[[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?\] \[[^\]]+\]: [\w\s\S]+ issued server command: \/[^ ]+/i,
};

let socket;
let isBackup = false;
let receivedMessages = [];
let filterTypes = [
  "all",
  "joinorleft",
  "cmdexec",
  "deathmsg",
  "warn",
  "error",
  "info",
  "chatmsg",
  "other",
];
let limit = 1000;

function connectWebSocket() {
  socket = new WebSocket(
    "ws://" +
      window.location.origin.replace("http://", "") +
      "/ws1" +
      "?limit=" +
      limit
  );

  socket.onmessage = async function (event) {
    if (!isBackup) {
      const outputDiv = document.getElementById("console");
      const lines = event.data.split("\n");

      await Promise.all(
        lines.map(async (line) => {
          line = line.trim();
          if (line.length === 0 || receivedMessages.includes(line)) return;

          const lineElement = document.createElement("div");
          if (
            regexList.joinRegex.test(line) ||
            regexList.leftRegex.test(line)
          ) {
            lineElement.setAttribute("data-type", "joinorleft");
          } else if (regexList.chatRegex.test(line)) {
            lineElement.setAttribute("data-type", "chatmsg");
          } else if (regexList.commandRegex.test(line)) {
            lineElement.setAttribute("data-type", "cmdexec");
          } else if (testDeathMessage(line)) {
            lineElement.setAttribute("data-type", "deathmsg");
          } else if (regexList.warnRegex.test(line)) {
            lineElement.setAttribute("data-type", "warn");
          } else if (regexList.errorRegex.test(line)) {
            lineElement.setAttribute("data-type", "error");
          } else if (regexList.infoRegex.test(line)) {
            lineElement.setAttribute("data-type", "info");
          } else {
            lineElement.setAttribute("data-type", "other");
          }

          lineElement.textContent = line;
          lineElement.classList.add("message-div");
          lineElement.id = "message_" + Date.now();
          lineElement.classList.add("new-message");
          outputDiv.appendChild(lineElement);

          filterMessages();
          addMenuListeners();

          setTimeout(() => {
            lineElement.classList.remove("new-message");
          }, 1000);

          receivedMessages.push(line);
        })
      );

      outputDiv.scrollTop = outputDiv.scrollHeight;
    }
  };

  socket.onerror = function (error) {
    console.error("WebSocket error:", error);
  };

  socket.onclose = function () {
    console.log("WebSocket connection closed. Reconnecting in 1 second...");
    setTimeout(connectWebSocket, 1000);
  };
}

function testDeathMessage(message) {
  const deathMessageRegex = {
    cactus: /was pricked to death/,
    drown: /drowned/,
    dryOut: /died from dehydration/,
    elytra: /experienced kinetic energy/,
    explosion: /blew up/,
    fall: /hit the ground too hard/,
    fire: /went up in flames/,
    lava: /tried to swim in lava/,
    lightning: /was struck by lightning/,
    magma: /discovered the floor was lava/,
    magic: /was killed by magic/,
    playerKill: /was slain by [A-Za-z0-9_]+/,
    beeKill: /was stung to death/,
    wardenKill: /was obliterated by a sonically-charged shriek/,
    maceKill: /was smashed by [A-Za-z0-9_]+/,
    arrowKill: /was shot by [A-Za-z0-9_]+/,
    fireballKill: /was fireballed by [A-Za-z0-9_]+/,
    tridentKill: /was impaled by [A-Za-z0-9_]+/,
    starve: /starved to death/,
    suffocate: /suffocated in a wall/,
    cramming: /was squished too much/,
    void: /fell out of the world/,
    wither: /withered away/,
    genericDeath: /died/,
    killCommand: /was killed/,
  };

  for (const [deathType, regex] of Object.entries(deathMessageRegex)) {
    if (regex.test(message)) {
      return true;
    }
  }
  return false;
}

function addFilter(value, isChecked) {
  if (isChecked) {
    if (!filterTypes.includes(value)) {
      filterTypes.push(value);
    }
  } else {
    filterTypes = filterTypes.filter((filter) => filter !== value);
  }
  filterMessages();
}

function filterMessages(types = filterTypes) {
  const messages = document.querySelectorAll("#console .message-div");

  messages.forEach((message) => {
    if (types.includes(message.getAttribute("data-type"))) {
      message.style.display = "block";
    } else {
      message.style.display = "none";
    }
  });
}

const customMenu = document.getElementById("customMenu");
let clickedElement = null;
let markedText = null;

function showMenu(x, y) {
  customMenu.style.left = `${x}px`;
  customMenu.style.top = `${y}px`;
  customMenu.style.display = "flex";
}

function hideMenu() {
  customMenu.style.display = "none";
  document.querySelectorAll(".clickedElement").forEach((element) => {
    element.classList.remove("clickedElement");
  });

  clickedElement = null;
}

async function addMenuListeners() {
  const outputDiv = document.getElementById("console");

  outputDiv.addEventListener("contextmenu", (event) => {
    if (event.target && event.target.classList.contains("message-div")) {
      event.preventDefault();
      markedText = getSelectedText();
      clickedElement = event.target;
      event.target.classList.add("clickedElement");
      showMenu(event.pageX, event.pageY);
      setTimeout(() => {
        event.target.classList.remove("clickedElement");
      }, 250);
    }
  });
  document.addEventListener("click", () => hideMenu());

  let touchTimer;
  outputDiv.addEventListener("touchstart", (event) => {
    if (event.target && event.target.classList.contains("message-div")) {
      touchTimer = setTimeout(() => {
        const touch = event.touches[0];
        clickedElement = event.target;
        event.target.classList.add("clickedElement");
        markedText = window.getSelection().toString();
        showMenu(touch.pageX, touch.pageY);
        setTimeout(() => {
          event.target.classList.remove("clickedElement");
        }, 250);
      }, 500);
    }
  });

  outputDiv.addEventListener("touchend", () => {
    clearTimeout(touchTimer);
    hideMenu();
  });
}

function getSelectedText() {
  return window.getSelection().toString();
}

function hideText() {
  console.log(markedText);
}

function isVisible(element) {
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
}

function downloadLog() {
  const consoleContent = document.getElementById("console").children;
  let textToDownload = "";

  const header = "==== Console Messages ====\n";
  const date = new Date();
  const dateString = `Date: ${date.toLocaleString()}\n`;
  const userData = `Downloaded by: ${parseJwt(token).username || "Guest"}\n\n`;

  textToDownload += header;
  textToDownload += dateString;
  textToDownload += userData;

  for (let i = 0; i < consoleContent.length; i++) {
    if (isVisible(consoleContent[i])) {
      textToDownload += consoleContent[i].innerText + "\n";
    }
  }

  const blob = new Blob([textToDownload], { type: "text/plain" });

  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = "console.txt";
  downloadLink.click();
}
