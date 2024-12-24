const fs = require('fs');
const { readLogData } = require('../utils/fileUtils');
const { parse } = require('url');

const logFilePath = '/home/max/SurvivalGHG/logs/latest.log';


const getLastLines = (data, lineCount = 1000) => {
    const lines = data.split('\n');
    return lines.slice(-lineCount).join('\n');
};

const initWebSocket = (wsServer) => {
    wsServer.on('connection', (ws, req) => {

        const queryParams = parse(req.url, true).query;

        const sendLogData = () => {
            readLogData(logFilePath, (err, data) => {
                if (err) {
                    console.error(`Error reading log file: ${err}`);
                    ws.send('Error reading log file');
                    return;
                }
                
                const lastLines = getLastLines(data, queryParams.limit);
                ws.send(lastLines);
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

    console.log('WebSocket server initialized.');
};

module.exports = initWebSocket;
