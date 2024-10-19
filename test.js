const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Statisches Verzeichnis für noVNC
app.use('/novnc', express.static(path.join(__dirname, 'noVNC')));

// Startseite
app.get('/', (req, res) => {
    res.send(`
        <h1>Remote KDE Plasma Desktop</h1>
        <p>Click <a href="/novnc/vnc.html?host=localhost&port=6080">here</a> to access the remote desktop.</p>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
