const si = require('systeminformation');

exports.getSystemInfo = async (req, res) => {
    try {
        const cpu = await si.cpu();
        const cpuLoad = await si.currentLoad();

        const memory = await si.mem();
        const usedMemory = memory.total - memory.free;

        const diskInfo = await si.fsSize();

        const disksWithUsage = diskInfo
            .filter(disk => disk.mount === '/' || disk.mount === '/mnt/backup')
            .map(disk => ({
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
            ) || { ip4: 'N/A', ip6: 'N/A', mac: 'N/A' };

            return {
                iface: ifaceStats.iface,
                ip4: ifaceDetails.ip4 || 'N/A',
                ip6: ifaceDetails.ip6 || 'N/A',
                mac: ifaceDetails.mac || 'N/A',
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

        res.json(systemInfo);
    } catch (error) {
        console.error('Error fetching system info:', error);
        res.status(500).json({ error: 'Failed to fetch system info' });
    }
}

exports.getTopProcesses =  (req, res) => {
    const { exec } = require('child_process');
    exec('ps aux --sort=-%cpu', (error, stdout) => {
        if (error) {
            console.error(`Fehler beim Ausführen des Befehls: ${error}`);
            return res.status(500).json({ error: 'Fehler beim Abrufen der Prozesse' });
        }

        const lines = stdout.split('\n');

        const currentPid = process.pid;

        const processes = lines.slice(1).map(line => {
            const details = line.split(/\s+/);
            return {
                user: details[0],
                pid: details[1],
                cpu: details[2],
                mem: details[3],
                command: details.slice(10).join(' ')
            };
        }).filter(process => process.pid && !(process.pid === currentPid.toString() && process.command === 'ps aux'));
        const topProcesses = processes.slice(0, 5);
        res.json(topProcesses);
    });
}