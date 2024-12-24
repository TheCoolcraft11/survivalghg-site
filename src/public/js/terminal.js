const token = sessionStorage.getItem("authToken");

function changeUrlPort(url, newPort) {
  try {
    const parsedUrl = new URL(url);
    parsedUrl.port = newPort;
    parsedUrl.pathname = "/";
    parsedUrl.protocol = "ws:";
    return parsedUrl.toString();
  } catch (error) {
    console.error("Invalid URL provided:", error);
    return null;
  }
}

const terminal = new Terminal();
terminal.open(document.getElementById("terminal"));

const socket = new WebSocket(
  "ws://" +
    window.location.origin.replace("http://", "") +
    "/ws2" +
    `?token=${token}`
);

socket.onmessage = (event) => {
  terminal.write(event.data);
};

terminal.onData((data) => {
  socket.send(data);
});

socket.onclose = (event) => {
  if (event.code == 3003) {
    console.error("Failed to connect: " + event.reason);
    document.getElementById("unauthorized-message").style.display = "block";
    document.getElementById("terminal").style.display = "none";
    document.getElementById("unauthorized-message").innerHTML =
      "Forbidden: Only Admins can access this.";
  } else if (event.code == 3000) {
    console.error("Failed to connect: " + event.reason);
    document.getElementById("unauthorized-message").style.display = "block";
    document.getElementById("terminal").style.display = "none";
    document.getElementById("unauthorized-message-text").innerHTML =
      "Unauthorized: You do not have permission to access this.";
  } else if (event.code == 4001) {
    console.log("Session ended: " + event.reason);
    document.getElementById("unauthorized-message").style.display = "block";
    document.getElementById("unauthorized-message").style.border =
      "2px solid #ffb300";
    document.getElementById("unauthorized-message").style.color = "#ffb300";
    document.getElementById("terminal").style.display = "none";
    document.getElementById("unauthorized-message-text").innerHTML =
      "Session ended due to inactivity";
  }
  if (event.code == 1006) {
    console.log("Session ended: " + event.reason);
    document.getElementById("unauthorized-message").style.display = "block";
    document.getElementById("terminal").style.display = "none";
    document.getElementById("unauthorized-message-text").innerHTML =
      "Couldn't connect to session";
  } else if (event.code == 1000) {
    console.log("Session ended: " + event.reason);
    document.getElementById("unauthorized-message").style.display = "block";
    document.getElementById("unauthorized-message").style.border =
      "2px solid #1aff00";
    document.getElementById("unauthorized-message").style.color = "#1aff00";
    document.getElementById("unauthorized-message").style.backgroundColor =
      "#e2fdd7";
    document.getElementById("terminal").style.display = "none";
    document.getElementById("unauthorized-message-text").innerHTML =
      "You have ended the session";
  } else if (event.code == 1011) {
    console.log("Session ended: " + event.reason);
    document.getElementById("unauthorized-message").style.display = "block";
    document.getElementById("terminal").style.display = "none";
    document.getElementById("unauthorized-message-text").innerHTML =
      "Server Error";
  } else {
    console.log(
      "Unexpected End with Code:" +
        event.code +
        " with message: " +
        event.reason
    );
    document.getElementById("unauthorized-message").style.display = "block";
    document.getElementById("terminal").style.display = "none";
    document.getElementById("unauthorized-message-text").innerHTML =
      "Unexpected Error";
  }
};

window.addEventListener("resize", () => {
  const width = Math.floor(window.innerWidth / 20);
  const height = Math.floor(window.innerHeight / 30);
  terminal.resize(width, height);
});

window.onload = terminal.resize(
  Math.floor(window.innerWidth / 20),
  Math.floor(window.innerHeight / 30)
);
