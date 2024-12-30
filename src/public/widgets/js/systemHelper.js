let socket2;

function connectWebSocket(onMessageCallback) {
  socket2 = new WebSocket(
    window.location.origin.replace("http", "ws") + "/ws2"
  );

  socket2.onopen = () => {
    console.log("WebSocket connection established");
  };

  socket2.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessageCallback(data);
  };

  socket2.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket2.onclose = () => {
    console.log("WebSocket connection closed. Reconnecting...");
    setTimeout(() => connectWebSocket2(onMessageCallback), 5000);
  };
}
