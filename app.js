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

const app = express();
const logFilePath = '/home/max/Test/logs/latest.log';
const screenSessionName = 'ScreenTest';

const db = mysql.createConnection({
    host: 'localhost',
    user: 'max',
    password: 'MinecraftGHG24!',
    database: 'mcUsers'
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


app.get('/get-profile', authenticateToken, (req, res) => {
    res.json({ message: { username: req.user.username, role: req.user.role } });
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