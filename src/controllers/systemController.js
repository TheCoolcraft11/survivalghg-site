const si = require('systeminformation');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

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

exports.runSpeedTest = async (req, res) => {
    try {
        const { stdout, stderr } = await execAsync('speedtest');
        if (stderr) {
            console.error(`Speedtest error output: ${stderr}`);
            return res.status(500).json({ error: 'Speedtest encountered an error' });
        }
        const downloadMatch = stdout.match(/Download:\s+([\d.]+)\s+Mbit\/s/);
        const uploadMatch = stdout.match(/Upload:\s+([\d.]+)\s+Mbit\/s/);
        const pingMatch = stdout.match(/Hosted by .+ \[(\d+\.\d+)\s+km\]:\s+([\d.]+)\s+ms/);

        const result = {
            download: downloadMatch ? downloadMatch[1] : 'N/A',
            upload: uploadMatch ? uploadMatch[1] : 'N/A',
            ping: pingMatch ? pingMatch[2] : 'N/A',
            distance: pingMatch ? pingMatch[1] : 'N/A',
        };

        res.json(result);
    } catch (error) {
        console.error(`Error executing speedtest: ${error}`);
        res.status(500).json({ error: 'Failed to run speedtest' });
    }
};