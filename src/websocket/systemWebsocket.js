const WebSocket = require("ws");
const si = require("systeminformation");

function setupWebsocket(wss) {
  wss.on("connection", (ws) => {
    console.log("Client connected");

    const sendSystemInfo = async () => {
      try {
        const cpu = await si.cpu();
        const cpuLoad = await si.currentLoad();
        const memory = await si.mem();
        const usedMemory = memory.total - memory.free;
        const diskInfo = await si.fsSize();
        const disksWithUsage = diskInfo
          .filter((disk) => disk.mount === "/" || disk.mount === "/mnt/backup")
          .map((disk) => ({
            mount: disk.mount,
            size: disk.size,
            used: disk.used,
            available: disk.available,
          }));
        const networkStats = await si.networkStats();
        const networkInterfaces = await si.networkInterfaces();
        const networkTraffic = networkStats.map((ifaceStats) => {
          const ifaceDetails = networkInterfaces.find(
            (iface) => iface.iface === ifaceStats.iface
          ) || { ip4: "N/A", ip6: "N/A", mac: "N/A" };

          return {
            iface: ifaceStats.iface,
            ip4: ifaceDetails.ip4 || "N/A",
            ip6: ifaceDetails.ip6 || "N/A",
            mac: ifaceDetails.mac || "N/A",
            tx_bytes: ifaceStats.tx_bytes || 0,
            rx_bytes: ifaceStats.rx_bytes || 0,
            upload_speed: ifaceStats.tx_sec,
            download_speed: ifaceStats.rx_sec,
          };
        });

        const systemInfo = {
          cpu: {
            manufacturer: cpu.manufacturer,
            brand: cpu.brand,
            cores: cpu.cores,
            usage: cpuLoad.currentLoad.toFixed(2),
          },
          memory: {
            total: memory.total,
            used: usedMemory,
          },
          disks: disksWithUsage,
          network: networkTraffic,
        };

        ws.send(JSON.stringify(systemInfo));
      } catch (error) {
        console.error("Error fetching system info:", error);
      }
    };

    const interval = setInterval(sendSystemInfo, 1000);

    ws.on("close", () => {
      console.log("Client disconnected");
      clearInterval(interval);
    });
  });
}

module.exports = setupWebsocket;
