const useragent = require("useragent");
const fs = require('fs');
const {generateUniqueId} = require('../utils/uuidUtils');
const { default: axios } = require("axios");
const path = require("path");

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

module.exports = logUserData();