const fs = require('fs');
const path = require('path');
const net = require('net');
const screenSessionName = 'SurvivalGHG';
const { queryServer } = require('../services/minecraftQuery');

exports.startMcServer = (req, res) => {
    isMinecraftServerRunning(isRunning => {
        const exec = require('child_process').exec;
        if (!isRunning) {
            const command = req.body.command;

            exec(`screen -list`, (err, stdout) => {

                if (stdout.includes(screenSessionName)) {
                   /* exec(`screen -XS ${screenSessionName} quit`, (err, stdout) => {
                        console.log(stdout)
                        if (err) {
                            console.error(`Error creating screen session: ${err}`);
                        }
                    }); */
                    return;
                }
                exec(`mcserver ~/SurvivalGHG\n`, (err) => {
                    if (err) {
                        console.error(`Error executing command: ${err}`);
                        return res.send('Error sending command');
                    } else {
                        res.status(200).json({ message: `Executed command: ` + command });
                    }
                });

            });
        } else {
            res.status(200).json({ type: 'Not Running', message: 'Minecraft server is not running' });
        }
    });
}

exports.killMcServer = (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access forbidden: Admins only' });
    }

    isMinecraftServerRunning(isRunning => {
        if (isRunning) {
            const command = req.body.command;
            const exec = require('child_process').exec;

            exec(`pkill -f server.jar \n"`, (err) => {
                if (err) {
                    console.error(`Error executing command: ${err}`);
                    return res.send('Error sending command');
                } else {
                    res.status(200).json({ message: `Executed command: ` + command });
                }
            });
        } else {
            res.status(200).json({ type: 'Not Running', message: 'Minecraft server is not running' })
        }
    });
}



exports.sendMcCommand = (req, res) => {
    const command = req.body.command;
    if (!command) {
        return res.status(400).json({ error: 'Command is required' });
    }
    isMinecraftServerRunning(isRunning => {
        if (isRunning) {
            sendCommand(command);
            return res.status(200).json({ message: 'Command sent successfully.' });
        }else {
            return res.status(200).json({ message: 'Server not running.' });
        }
    });
    
}


exports.stopMcServer = (req, res) => {
    isMinecraftServerRunning(isRunning => {
        if (isRunning) {
            sendCommand('stop');
            return res.status(200).json({ message: 'Server stopped successfully.' });
        }else {
            return res.status(200).json({ message: 'Server not running.' });
        }
    });
}

exports.restartMcServer = (req, res) => {
    isMinecraftServerRunning(isRunning => {
        if (isRunning) {
            sendCommand('restart');
            return res.status(200).json({ message: 'Server restarted successfully.' });
        }else {
            return res.status(200).json({ message: 'Server not running.' });
        }
    });
}

function sendCommand(command) {
            const exec = require('child_process').exec;

            exec(`screen -S ${screenSessionName} -X stuff "${command}\n"`, (err) => {
                if (err) {
                    console.log(err)
                    return
                } else {
                    console.log(err)
                    return
                }
        });
}

const BACKUP_DIR = '/mnt/backup';

exports.getBackups = (req, res) => {

    fs.readdir(BACKUP_DIR, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to scan directory' });
        }

        const backups = files
            .filter(file => file.endsWith('.tar.gz'))
            .map(file => {
                const filePath = path.join(BACKUP_DIR, file);
                const stats = fs.statSync(filePath);

                return {
                    name: file,
                    size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
                    createdAt: stats.birthtime.toISOString(),
                    downloadUrl: `/api/backup/download/${file}`
                };
            });

        res.json(backups);
    });
}

exports.getBackupStatus = (req, res) => {
    //res.json({ 'size': '1GiB', 'progress': '12%', 'eta': '10:01:12', 'status': 'creating', 'type': 'test' });

    const sessionName = 'SurvivalGHG';
    const { exec } = require('child_process');
    exec(`screen -S ${sessionName} -X hardcopy /tmp/screen.log && cat /tmp/screen.log`, (err, stdout, stderr) => {
        if (err) {
            return res.json({ error: 'Screen session could not be read.' });
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).json({ error: 'An error occured' });
        }

        const backupStatus = extractBackupStatus(stdout);

        res.json(backupStatus);
    });
}

exports.downloadBackup = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(BACKUP_DIR, filename);

    if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);

        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Length': stat.size,
            'Content-Disposition': `attachment; filename="${filename}"`,
        });

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on('error', (err) => {
            console.error('Error streaming file:', err.message);
            res.status(500).json({ error: 'Error streaming file' });
        });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
}

exports.deleteBackup = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(BACKUP_DIR, filename);

    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete file' });
            }
            res.json({ message: 'File deleted successfully' });
        });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
}

function extractBackupStatus(output) {
    const sizeMatch = output.match(/(\d+,\d+\w{2})/);
    const size = sizeMatch ? sizeMatch[1] + "B" : 'N/A';

    const progressEtaMatch = output.match(/(\d+)%\s+ETA\s+([^\s]+)/);
    const progress = progressEtaMatch ? `${progressEtaMatch[1]}%` : 'N/A';
    const eta = progressEtaMatch ? progressEtaMatch[2] : 'N/A';

    return { size, progress, eta };
}


function isMinecraftServerRunning(callback) {
    const port = 25566;
    const host = 'localhost';

    const socket = new net.Socket();

    socket.setTimeout(2000);

    socket.on('connect', () => {
        socket.destroy();
        callback(true);
    });

    socket.on('timeout', () => {
        socket.destroy();
        callback(false);
    });

    socket.on('error', () => {
        callback(false);
    });

    socket.connect(port, host);

}

exports.getServerQuery = async (req, res) => {
    res.json(await queryServer('localhost', 25566));
};
