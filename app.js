const express = require('express');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const net = require('net');
const axios = require('axios');
const crypto = require('crypto');
const useragent = require('useragent');
const multer = require('multer');
const os = require('os');
const si = require('systeminformation');
const { v5: uuidv5 } = require('uuid');
const uuidNamespace = uuidv5.DNS;
const http = require('http');
const { WebSocketServer } = require('ws');
const pty = require('node-pty');

require('dotenv').config();

const app = express();
const logFilePath = '/home/max/SurvivalGHG/logs/latest.log';
const screenSessionName = 'SurvivalGHG';

const db = mysql.createConnection({
    host: 'localhost',
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});



db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL');
});



function generateUniqueId(ip, userAgentString) {
    const hash = crypto.createHash('sha256');
    hash.update(ip + userAgentString);
    return hash.digest('hex');
}


async function logUserData(req, ip, url, username) {
    const ip2 = [
        req.headers['cf-connecting-ip'],
        req.headers['x-real-ip'],
        req.headers['x-forwarded-for'],
        req.socket.remoteAddress
    ]

    const userAgent = useragent.parse(req.headers['user-agent']);
    let userId = generateUniqueId(ip, req.headers['user-agent']);
    if (username) {
        userId = username;
    }


    let city = 'Unknown';
    try {

        const geoResponse = await axios.get(`https://ipapi.co/${ip}/json/`);
        city = geoResponse.data.city || 'Unknown';
    } catch (err) {
        console.error('Error fetching IP location:', err.message);
    }
    const userData = {
        username,
        url,
        ip,
        ip2,
        city,
        device: {
            browser: userAgent.family,
            os: userAgent.os.family,
            device: userAgent.device.family
        },
        timestamp: getTimestamp()
    };

    const logFilePath = path.join(__dirname, 'logs', `${userId}.json`);


    fs.readFile(logFilePath, 'utf8', (err, data) => {
        let logs = [];
        if (!err && data) {
            logs = JSON.parse(data);
        }
        logs.push(userData);

        fs.writeFile(logFilePath, JSON.stringify(logs, null, 2), (err) => {
            if (err) {
                console.error('Error writing user log:', err.message);
            } else {

            }
        });
    });
}

function getTimestamp() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
const JWT_SECRET = 'myveryveryseretcode';

app.get('/', (req, res) => {

    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/console', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'console.html'));
});


app.post('/api/mc/send', authenticateToken, (req, res) => {

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access forbidden: Admins only' });
    }

    isMinecraftServerRunning(isRunning => {
        if (isRunning) {
            const command = req.body.command;
            const exec = require('child_process').exec;

            exec(`screen -S ${screenSessionName} -X stuff "${command}\n"`, (err) => {
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
});

app.post('/api/mc/kill', authenticateToken, (req, res) => {

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
});

app.post('/api/mc/start', (req, res) => {
    isMinecraftServerRunning(isRunning => {
        const exec = require('child_process').exec;
        if (!isRunning) {
            const command = req.body.command;

            exec(`screen -list`, (err, stdout, stderr) => {

                if (!stdout.includes(screenSessionName) || stdout.includes('No Sockets found in')) {
                    exec(`screen -XS ${screenSessionName} quit`, (err) => {
                        if (err) {
                            console.error(`Error creating screen session: ${err}`);
                            return res.send('Error starting Minecraft server');
                        }
                    });
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
});

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

const server = app.listen(3000, () => {
    console.log('HTTP server running on http://localhost:3000');
});


function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        req.user = user;
        next();
    });
}

function readToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];


    jwt.verify(token, JWT_SECRET, (err, user) => {
        req.user = user;
        next();
    });
}


app.post('/api/send-register', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);


        db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], (err, result) => {
            if (err) {
                console.error('Error registering user:', err.message);
                return res.status(500).json({ message: 'Registration failed' });
            }
            res.status(201).json({ message: 'User registered successfully!' });
        });
    } catch (err) {
        console.error('Error hashing password:', err.message);
        res.status(500).json({ message: 'Registration failed' });
    }
});


app.post('/api/send-login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.error('Error logging in:', err.message);
            return res.status(500).json({ message: 'Login failed' });
        }

        if (results.length === 0) return res.status(401).json({ message: 'User not found' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) return res.status(401).json({ message: 'Invalid credentials' });


        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
});

app.get('/profile', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});




app.post('/api/admin-action', authenticateToken, (req, res) => {

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access forbidden: Admins only' });
    }


    res.json({ message: `Admin action performed by ${req.user.username}` });
});
app.post('/api/receive-ip', readToken, (req, res) => {
    const { ip, url } = req.body;
    let username = 'Guest';
    if (req.user) {
        username = req.user.username || 'Guest';
    }

    if (!username) {
        username = 'N/A';
    }
    logUserData(req, ip, url, username)

    res.status(200).send('IP address received');
});



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profile-pictures');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});


const uploadProfilePic = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Only images are allowed');
        }
    }
});

app.post('/api/upload-profile-picture', authenticateToken, uploadProfilePic.single('profilePicture'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or invalid file type' });
    }

    const profilePicPath = '/uploads/profile-pictures/' + req.file.filename;

    db.query('UPDATE users SET profile_picture = ? WHERE id = ?', [profilePicPath, req.user.id], (err, result) => {
        if (err) {
            console.error('Error updating profile picture:', err.message);
            return res.status(500).json({ message: 'Error updating profile picture' });
        }

        res.status(200).json({ message: 'Profile picture updated successfully', profilePicture: profilePicPath });
    });
});

app.use('/uploads', express.static('uploads'));

app.get('/api/profile', authenticateToken, (req, res) => {
    db.query('SELECT username, role, profile_picture FROM users WHERE id = ?', [req.user.id], (err, results) => {
        if (err) {
            console.error('Error retrieving profile:', err.message);
            return res.status(500).json({ message: 'Error retrieving profile' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];
        res.json({
            message: {
                username: user.username,
                role: user.role,
                profile_picture: user.profile_picture || '/uploads/profile-pictures/default.jpg'
            }
        });
    });
})
app.post('/api/update-name', authenticateToken, (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }


    db.query('UPDATE users SET username = ? WHERE id = ?', [name, userId], (err, result) => {
        if (err) {
            console.error('Error updating name:', err);
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
        res.json({ success: true, message: 'Name updated successfully' });
    });
});


app.post('/api/update-password', authenticateToken, async (req, res) => {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }

    try {

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);


        db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err, result) => {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            }
            res.json({ success: true, message: 'Password updated successfully' });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});



app.get('/api/info', async (req, res) => {
    try {
        const cpu = await si.cpu();
        const cpuLoad = await si.currentLoad();


        const memory = await si.mem();
        const usedMemory = memory.total - memory.free;
        const disks = await si.diskLayout();
        const diskInfo = await si.fsSize();

        const disksWithUsage = disks.map((disk, index) => {
            const used = diskInfo[index] ? diskInfo[index].used : 0;
            return {
                name: disk.name,
                size: (disk.size / 1024 / 1024 / 1024).toFixed(2) + ' GB',
                used: (used / 1024 / 1024 / 1024).toFixed(2) + ' GB'
            };
        });


        const networkStats = await si.networkStats();

        const networkTraffic = networkStats.map(iface => ({
            iface: iface.iface,
            mac: iface.mac || 'N/A',
            ip: iface.ip4 || 'N/A',
            ip6: iface.ip4 || 'N/A',
            tx_bytes: iface.tx_bytes || 0,
            rx_bytes: iface.rx_bytes || 0,
            upload: (iface.tx_bytes / 1024 / 1024).toFixed(2) + ' MB',
            download: (iface.rx_bytes / 1024 / 1024).toFixed(2) + ' MB',
        }));

        const systemInfo = {
            cpu: {
                manufacturer: cpu.manufacturer,
                brand: cpu.brand,
                cores: cpu.cores,
                usage: cpuLoad.currentLoad.toFixed(2),
            },
            memory: {
                total: (memory.total / 1024 / 1024).toFixed(2) + ' MB',
                used: (usedMemory / 1024 / 1024).toFixed(2) + ' MB',
            },
            disks: disksWithUsage,
            network: networkTraffic
        };

        res.json(systemInfo);
    } catch (error) {
        console.error('Error fetching system info:', error);
        res.status(500).json({ error: 'Failed to fetch system info' });
    }
});


const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/screenshots');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});


const screenshotStorage = multer({
    storage: storage2,
    limits: { fileSize: 3500000 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Only images are allowed');
        }
    }
});

app.post('/api/upload-screenshot', screenshotStorage.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    console.log(`Uploaded file: ${req.file.filename}`);
    res.status(200).send('File uploaded successfully.');
});

app.set('view engine', 'ejs');

app.get('/screenshots', (req, res) => {
    const imagesDir = path.join(__dirname, 'uploads/screenshots');

    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        }

        const images = files.filter(file => {
            return file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.gif');
        });

        res.render('screenshots', { images });
    });
});


app.get('/api/users', authenticateToken, (req, res) => {
    db.query('SELECT id, username, role FROM users', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});
app.post('/api/users', async (req, res) => {
    const { username, role, password } = req.body;


    if (!username || !role || !password) {
        return res.status(400).json({ error: 'Please provide a username, role, and password' });
    }

    try {

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (username, role, password) VALUES (?, ?, ?)';
        db.query(query, [username, role, hashedPassword], (error, results) => {
            if (error) {
                console.error('Error inserting user:', error);
                return res.status(500).json({ error: 'Database error' });
            }

            res.status(201).json({
                message: 'User added successfully',
                userId: results.insertId,
                username: username,
                role: role
            });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Error processing request' });
    }
});


app.delete('/api/users/:id', authenticateToken, (req, res) => {
    const userId = req.params.id;
    db.query('DELETE FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) throw err;
        res.json({ success: true });
    });
});

app.post('/api/users/:id', authenticateToken, async (req, res) => {
    const userId = req.params.id;
    const role = req.body.role;
    const name = req.body.name;
    const password = req.body.password;
    const method = req.body.method;
    if (method) {
        if (method == "role") {
            if (userId && role) {
                db.query('UPDATE users SET role = ? WHERE id = ?', [role, userId], (err, results) => {
                    if (err) throw err;
                    res.json({ success: true });
                });
            } else {
                return res.status(400).json({ error: 'Please provide a userid and role' });
            }
        }
        if (method == "name") {
            if (userId && name) {
                db.query('UPDATE users SET username = ? WHERE id = ?', [name, userId], (err, results) => {
                    if (err) throw err;
                    res.json({ success: true });
                });
            } else {
                return res.status(400).json({ error: 'Please provide a userid and name' });
            }
        }
        if (method == "password") {
            if (userId && password) {
                try {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err, results) => {
                        if (err) throw err;
                        res.json({ success: true });
                    });
                } catch (error) {
                    console.log('Error hashing password' + error)
                    res.status(500).json({ error: 'Error processing request' });
                }
            } else {
                return res.status(400).json({ error: 'Please provide a userid and password' });
            }
        }
    }
});

app.get('/widgets', (req, res) => {
    fs.readFile('widgets.json', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading widgets file');
        }
        res.json(JSON.parse(data));
    });
});

app.get('/widgets', (req, res) => {
    res.sendFile(path.join(__dirname, 'widgets'));
});

app.post('/all-widgets', (req, res) => {
    const newWidget = req.body;

    fs.readFile('widgets.json', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading widgets file');
        }
        const widgets = JSON.parse(data);

        widgets.push(newWidget);

        fs.writeFile('widgets.json', JSON.stringify(widgets, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error saving widget');
            }
            res.status(201).send('Widget created');
        });
    });
});

app.get('/top-processes', (req, res) => {
    const { exec } = require('child_process');
    exec('ps aux --sort=-%cpu', (error, stdout, stderr) => {
        if (error) {
            console.error(`Fehler beim Ausführen des Befehls: ${error}`);
            return res.status(500).json({ error: 'Fehler beim Abrufen der Prozesse' });
        }

        const lines = stdout.split('\n');
        const headers = lines[0].split(/\s+/);
        const processes = lines.slice(1).map(line => {
            const details = line.split(/\s+/);
            return {
                user: details[0],
                pid: details[1],
                cpu: details[2],
                mem: details[3],
                command: details.slice(10).join(' ')
            };
        }).filter(process => process.pid);
        const topProcesses = processes.slice(0, 5);
        res.json(topProcesses);
    });
});


const BACKUP_DIR = '/mnt/backup';
app.get('/api/backups', authenticateToken, (req, res) => {
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
                    downloadUrl: `/download/${file}`
                };
            });

        res.json(backups);
    });
});

app.get('/download/:filename', authenticateToken, (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(BACKUP_DIR, filename);

    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

app.delete('/api/backups/:filename', authenticateToken, (req, res) => {
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
});

app.get('/users', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'users.html'));
});


const wServer1 = http.createServer();
const wServer2 = http.createServer();

const wss1 = new WebSocketServer({ server: wServer1 });


wss1.on('connection', (ws) => {

    const sendLogData = () => {
        fs.readFile(logFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error(`Error reading log file: ${err}`);
                ws.send('Error reading log file');
                return;
            }
            ws.send(data);
        });
    };

    sendLogData();

    const watcher = fs.watch(logFilePath, (eventType) => {
        if (eventType === 'change') {
            sendLogData();
        }
    });

    ws.on('close', () => {
        watcher.close();
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});
app.post('/api/dashboard-layout/save', authenticateToken, async (req, res) => {
    const layoutData = req.body.layoutData;
    db.query('UPDATE users SET dashboard_layout = ? WHERE id = ?', [layoutData, req.user.id], (err, result) => {
        if (err) {
            console.error('Error updating profile picture:', err.message);
            return res.status(500).json({ message: 'Error updating profile picture' });
        }

        res.status(200).json({ message: 'Layout updated successfully', layoutData: layoutData });
    });
});


app.get('/api/dashboard-layout/load', authenticateToken, async (req, res) => {
    db.query('SELECT dashboard_layout FROM users WHERE id = ?', [req.user.id], (err, results) => {
        if (err) {
            console.error('Error retrieving layout:', err.message);
            return res.status(500).json({ message: 'Error retrieving layout' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }


        res.json(results);
    });
});

function authenticateWsToken(token) {
    if (!token || token == 'null') return { error: 'Unauthorized' };

    try {
        let user = null;
        jwt.verify(token, JWT_SECRET, (err, user2) => {
            user = user2;
        });
        return { user };
    } catch (err) {
        return { error: 'Forbidden' };
    }
}


const wss2 = new WebSocketServer({ server: wServer2 });
const IDLE_TIMEOUT = 60000;

wss2.on('connection', (ws, req) => {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const token = urlParams.get('token');
    const authResult = authenticateWsToken(token);

    if (!authResult || !authResult.user) {
        ws.close(3000);
        return;
    }

    if (authResult.error) {
        ws.close(1011, authResult.error);
        return;
    }

    if (authResult.user.role != 'admin') {
        ws.close(3003, 'Only Admins can access this!');
        return;
    }

    console.log('New WebSocket connection');
    const scriptPath = '/bin/login';

    const shell = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 100,
        rows: 34,
        cwd: process.env.HOME,
        env: process.env
    });

    let idleTimer;

    const resetIdleTimer = () => {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            console.log('Closing terminal due to inactivity.');
            ws.close(4001, 'Session ended due to inactivity');
            shell.kill();
        }, IDLE_TIMEOUT);
    };

    shell.on('data', (data) => {
        ws.send(data);
        resetIdleTimer();
    });

    ws.on('message', (message) => {
        shell.write(message);
        resetIdleTimer();
    });

    shell.on('exit', (exitCode) => {
        console.log(`Shell exited with code: ${exitCode}`);
        ws.close(1000, 'Shell session ended.');
    });

    ws.on('close', () => {
        console.log('WebSocket connection closed');
        clearTimeout(idleTimer);
        shell.kill();
    });

    ws.on('resize', (cols, rows) => {
        shell.resize(cols, rows);
    });
});


wServer1.listen(8080, () => {
    console.log('WebSocket Server 1 is listening on ws://localhost:8080');
});

wServer2.listen(8081, () => {
    console.log('WebSocket Server 2 is listening on ws://localhost:8081');
});
