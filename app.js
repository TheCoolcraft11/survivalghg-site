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

require('dotenv').config();

const app = express();
const logFilePath = '/home/max/Test/logs/latest.log';
const screenSessionName = 'ScreenTest';

const db = mysql.createConnection({
    host: process.env.HOST,
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


async function logUserData(req, ip) {
    //const ip = [
    //req.headers['cf-connecting-ip'],
    //req.headers['x-real-ip'],
    //req.headers['x-forwarded-for'],
    //req.socket.remoteAddress
    //]

    const userAgent = useragent.parse(req.headers['user-agent']);
    const userId = generateUniqueId(ip, req.headers['user-agent']);

    let city = 'Unknown';
    try {

        const geoResponse = await axios.get(`https://ipapi.co/${ip}/json/`);
        city = geoResponse.data.city || 'Unknown';
    } catch (err) {
        console.error('Error fetching IP location:', err.message);
    }

    const userData = {
        userId,
        ip,
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
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
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


app.post('/send', authenticateToken, (req, res) => {

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

app.post('/kill', authenticateToken, (req, res) => {

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

app.post('/start', (req, res) => {
    isMinecraftServerRunning(isRunning => {
        const exec = require('child_process').exec;
        if (!isRunning) {
            const command = req.body.command;

            exec(`screen -list`, (err, stdout, stderr) => {
                console.log("Err: " + err, " StO: " + stdout, " StE: " + stderr + " - " + (!stdout.includes(screenSessionName) || stdout.includes('No Sockets found in')))

                if (!stdout.includes(screenSessionName) || stdout.includes('No Sockets found in')) {
                    exec(`screen -S ${screenSessionName} -d -m`, (err) => {
                        if (err) {
                            console.error(`Error creating screen session: ${err}`);
                            return res.send('Error starting Minecraft server');
                        }
                    });
                }
                exec(`screen -S ${screenSessionName} -X stuff "java -jar server.jar\n"`, (err) => {
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
    const port = 25565;
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

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {

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


app.post('/send-register', async (req, res) => {
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


app.post('/send-login', (req, res) => {
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




app.post('/admin-action', authenticateToken, (req, res) => {

    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access forbidden: Admins only' });
    }


    res.json({ message: `Admin action performed by ${req.user.username}` });
});
app.post('/api/receive-ip', (req, res) => {
    const { ip } = req.body;


    logUserData(req, ip)

    res.status(200).send('IP address received');
});



// Define storage for the profile pictures
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profile-pictures'); // Directory where profile pictures will be stored
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Set up multer upload with file size limit and filter for image types
const uploadProfilePic = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB file limit
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

app.post('/upload-profile-picture', authenticateToken, uploadProfilePic.single('profilePicture'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or invalid file type' });
    }

    const profilePicPath = '/uploads/profile-pictures/' + req.file.filename;

    // Update the user's profile picture in the database
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
app.post('/update-name', authenticateToken, (req, res) => {
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


app.post('/update-password', authenticateToken, async (req, res) => {
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
        // Get CPU Info
        const cpu = await si.cpu();
        const cpuLoad = await si.currentLoad(); // Get current CPU load

        // Get RAM Info
        const memory = await si.mem();
        const usedMemory = memory.total - memory.free; // Calculate used memory

        // Get Disk Info
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

        // Get Network Stats
        const networkStats = await si.networkStats();

        // Prepare network traffic data
        const networkTraffic = networkStats.map(iface => ({
            iface: iface.iface,
            mac: iface.mac || 'N/A',
            ip: iface.ip4 || 'N/A',
            ip6: iface.ip4 || 'N/A',
            tx_bytes: iface.tx_bytes || 0,
            rx_bytes: iface.rx_bytes || 0,
            upload: (iface.tx_bytes / 1024 / 1024).toFixed(2) + ' MB', // Convert to MB
            download: (iface.rx_bytes / 1024 / 1024).toFixed(2) + ' MB', // Convert to MB
        }));

        // Prepare response data
        const systemInfo = {
            cpu: {
                manufacturer: cpu.manufacturer,
                brand: cpu.brand,
                cores: cpu.cores,
                usage: cpuLoad.currentLoad.toFixed(2), // CPU usage percentage
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
