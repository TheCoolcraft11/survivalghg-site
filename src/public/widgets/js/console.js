let socket;
let isBackup = false;
let stopBackupCheck = false;
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
let limit = 50;

function connectWebSocket() {
  socket = new WebSocket(
    window.location.origin.replace("http", "ws") + "/ws1" + "?limit=" + limit
  );

  socket.onopen = () => {
    stopBackupCheck = true;
  };

  const regexList = {
    chatRegex:
      /[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?.*\[.*\].*<[\w\s\S]+>\s+[\w\s\S]+/i,
    warnRegex: /[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?.*(WARN|WARNING)/i,
    errorRegex: /[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?.*(ERR|ERROR)/i,
    infoRegex: /[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?.*(INFO)/i,
    joinRegex:
      /\[[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?\] \[[^\]]+\]: (\[[^\]]*\] )?[A-Za-z0-9]+(\s\[[^\]]*\])? joined the game/i,
    leftRegex:
      /\[[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?\] \[[^\]]+\]: (\[[^\]]*\] )?[A-Za-z0-9]+(\s\[[^\]]*\])? left the game/i,
    commandRegex:
      /\[[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?\] \[[^\]]+\]: [A-Za-z0-9]+ issued server command: \/[^ ]+/i,
  };

  socket.onmessage = function (event) {
    if (!isBackup) {
      const outputDiv = document.getElementById("console");
      const lines = event.data.split("\n");
      lines.forEach((line) => {
        line = line.trim();

        if (line.length === 0) return;

        if (!receivedMessages.includes(line)) {
          const lineElement = document.createElement("div");
          if (
            regexList.joinRegex.test(line) ||
            regexList.leftRegex.test(line)
          ) {
            lineElement.setAttribute("data-type", "joinorleft");
            //lineElement.style.color = 'lime'
          } else if (regexList.chatRegex.test(line)) {
            lineElement.setAttribute("data-type", "chatmsg");
            //lineElement.style.color = 'cyan';
          } else if (regexList.commandRegex.test(line)) {
            lineElement.setAttribute("data-type", "cmdexec");
            //lineElement.style.color = 'orange'
          } else if (testDeathMessage(line)) {
            lineElement.setAttribute("data-type", "deathmsg");
            //lineElement.style.color = 'red'
          } else if (regexList.warnRegex.test(line)) {
            lineElement.setAttribute("data-type", "warn");
            //lineElement.style.color = 'yellow';
          } else if (regexList.errorRegex.test(line)) {
            lineElement.setAttribute("data-type", "error");
            //lineElement.style.color = 'darkred';
          } else if (regexList.infoRegex.test(line)) {
            lineElement.setAttribute("data-type", "info");
            //lineElement.style.color = 'white';
          } else {
            lineElement.setAttribute("data-type", "other");
            //lineElement.style.color = 'white';
          }

          lineElement.textContent = line;
          lineElement.classList.add("message-div");
          lineElement.id = "message";
          lineElement.classList.add("new-message");
          lineElement.setAttribute("ignoreScroll", true);
          outputDiv.appendChild(lineElement);
          filterMessages();

          setTimeout(() => {
            lineElement.classList.remove("new-message");
          }, 1000);

          receivedMessages.push(line);
        }
      });

      outputDiv.scrollTop = outputDiv.scrollHeight;
    }
  };

  socket.onerror = function (error) {
    console.error("WebSocket error:", error);
  };

  socket.onclose = function () {
    console.log("WebSocket connection closed. Reconnecting in 1 second...");
    stopBackupCheck = false;
    setTimeout(connectWebSocket, 1000);
  };
}
function testDeathMessage(message) {
  const deathMessageRegex = {
    // **Cactus**
    cactus: /was pricked to death/,
    cactusEscape: /walked into a cactus while trying to escape [A-Za-z0-9_]+/,

    // **Drowning**
    drown: /drowned/,
    drownEscape: /drowned while trying to escape [A-Za-z0-9_]+/,

    // **Drying Out**
    dryOut: /died from dehydration/,
    dryOutEscape: /died from dehydration while trying to escape [A-Za-z0-9_]+/,

    // **Elytra (Fly into Wall)**
    elytra: /experienced kinetic energy/,
    elytraEscape:
      /experienced kinetic energy while trying to escape [A-Za-z0-9_]+/,

    // **Explosions**
    explosion: /blew up/,
    explosionPlayer: /was blown up by [A-Za-z0-9_]+/,
    explosionPlayerItem: /was blown up by [A-Za-z0-9_]+ using [A-Za-z0-9_]+/,

    // **Falling**
    fall: /hit the ground too hard/,
    fallEscape: /hit the ground too hard while trying to escape [A-Za-z0-9_]+/,
    fallHigh: /fell from a high place/,
    fallLadder: /fell off a ladder/,
    fallVines: /fell off some vines/,
    fallWeepingVines: /fell off some weeping vines/,
    fallTwistingVines: /fell off some twisting vines/,
    fallScaffolding: /fell off scaffolding/,
    fallClimbing: /fell while climbing/,
    fallDoomed: /was doomed to fall/,
    fallDoomedPlayer: /was doomed to fall by [A-Za-z0-9_]+/,
    fallDoomedPlayerItem:
      /was doomed to fall by [A-Za-z0-9_]+ using [A-Za-z0-9_]+/,
    fallStalagmite: /was impaled on a stalagmite/,
    fallStalagmiteEscape:
      /was impaled on a stalagmite while fighting [A-Za-z0-9_]+/,

    // **Falling Blocks**
    fallingAnvil: /was squashed by a falling anvil/,
    fallingBlock: /was squashed by a falling block/,
    fallingStalactite: /was skewered by a falling stalactite/,

    // **Fire**
    fire: /went up in flames/,
    fireEscape: /walked into fire while fighting [A-Za-z0-9_]+/,
    fireBurn: /burned to death/,
    fireBurnEscape: /was burned to a crisp while fighting [A-Za-z0-9_]+/,

    // **Firework Rockets**
    firework: /went off with a bang/,
    fireworkPlayerItem:
      /went off with a bang due to a firework fired from [A-Za-z0-9_]+ by [A-Za-z0-9_]+/,

    // **Lava**
    lava: /tried to swim in lava/,
    lavaEscape: /tried to swim in lava to escape [A-Za-z0-9_]+/,

    // **Lightning**
    lightning: /was struck by lightning/,
    lightningEscape: /was struck by lightning while fighting [A-Za-z0-9_]+/,

    // **Magma Block**
    magma: /discovered the floor was lava/,
    magmaEscape: /walked into the danger zone due to [A-Za-z0-9_]+/,

    // **Magic**
    magic: /was killed by magic/,
    magicEscape: /was killed by magic while trying to escape [A-Za-z0-9_]+/,
    magicPlayer: /was killed by [A-Za-z0-9_]+ using magic/,
    magicPlayerItem: /was killed by [A-Za-z0-9_]+ using [A-Za-z0-9_]+/,

    // **Players and Mobs**
    playerKill: /was slain by [A-Za-z0-9_]+/,
    playerKillItem: /was slain by [A-Za-z0-9_]+ using [A-Za-z0-9_]+/,
    beeKill: /was stung to death/,
    beeKillPlayerItem:
      /was stung to death by [A-Za-z0-9_]+ using [A-Za-z0-9_]+/,
    wardenKill: /was obliterated by a sonically-charged shriek/,
    wardenKillEscape:
      /was obliterated by a sonically-charged shriek while trying to escape [A-Za-z0-9_]+ wielding [A-Za-z0-9_]+/,
    maceKill: /was smashed by [A-Za-z0-9_]+/,
    maceKillItem: /was smashed by [A-Za-z0-9_]+ with [A-Za-z0-9_]+/,

    // **Projectiles**
    arrowKill: /was shot by [A-Za-z0-9_]+/,
    arrowKillItem: /was shot by [A-Za-z0-9_]+ using [A-Za-z0-9_]+/,
    fireballKill: /was fireballed by [A-Za-z0-9_]+/,
    fireballKillItem: /was fireballed by [A-Za-z0-9_]+ using [A-Za-z0-9_]+/,
    tridentKill: /was impaled by [A-Za-z0-9_]+/,
    tridentKillItem: /was impaled by [A-Za-z0-9_]+ with [A-Za-z0-9_]+/,
    witherSkullKill: /was shot by a skull from [A-Za-z0-9_]+/,
    witherSkullKillItem:
      /was shot by a skull from [A-Za-z0-9_]+ using [A-Za-z0-9_]+/,

    // **Starving**
    starve: /starved to death/,
    starveEscape: /starved to death while fighting [A-Za-z0-9_]+/,

    // **Suffocation**
    suffocate: /suffocated in a wall/,
    suffocateEscape: /suffocated in a wall while fighting [A-Za-z0-9_]+/,
    cramming: /was squished too much/,
    crammingPlayer: /was squashed by [A-Za-z0-9_]+/,
    border: /left the confines of this world/,
    borderEscape:
      /left the confines of this world while fighting [A-Za-z0-9_]+/,

    // **Sweet Berry Bushes**
    sweetBerryBush: /was poked to death by a sweet berry bush/,
    sweetBerryBushEscape:
      /was poked to death by a sweet berry bush while trying to escape [A-Za-z0-9_]+/,

    // **Thorns Enchantment**
    thorns: /was killed while trying to hurt [A-Za-z0-9_]+/,
    thornsItem:
      /was killed by [A-Za-z0-9_]+ while trying to hurt [A-Za-z0-9_]+/,

    // **Trident**
    tridentKill: /was impaled by [A-Za-z0-9_]+/,
    tridentKillItem: /was impaled by [A-Za-z0-9_]+ with [A-Za-z0-9_]+/,

    // **Void**
    void: /fell out of the world/,
    voidEscape: /didn't want to live in the same world as [A-Za-z0-9_]+/,

    // **Wither Effect**
    wither: /withered away/,
    witherEscape: /withered away while fighting [A-Za-z0-9_]+/,

    // **Generic Death**
    genericDeath: /died/,
    genericDeathPlayer: /died because of [A-Za-z0-9_]+/,
    killCommand: /was killed/,
    killCommandEscape: /was killed while fighting [A-Za-z0-9_]+/,
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
  const messages = document.querySelectorAll("#console #message");

  messages.forEach((message) => {
    if (types.includes(message.getAttribute("data-type"))) {
      message.style.display = "block";
    } else {
      message.style.display = "none";
    }
  });
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
  if (!stopBackupCheck) {
    fetch("/api/backups/status", {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("authToken")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const consoleElement = document.getElementById("console");
        if (
          data.progress &&
          data.progress !== "100%" &&
          data.progress != "N/A"
        ) {
          isBackup = true;
          progress = data.progress.replace("%", "");
          totalsize =
            ((formatString(data.size, true) / progress) * 100 * 0.75).toFixed(
              2
            ) +
            " " +
            formatString(data.size, false);
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
        } else if (data.progress === "100%") {
          consoleElement.innerHTML = "<p>Backup erfolgreich abgeschlossen!</p>";
          wasMakingBackup = true;
        } else {
          isBackup = false;
          if (wasMakingBackup) {
            consoleElement.innerHTML = "";
            wasMakingBackup = false;

            setTimeout(connectWebSocket(), 15000);
          }
        }
      })
      .catch((err) => {
        console.error("Fehler beim Abrufen des Backup-Status:", err);
      });
  }
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

initialize();
