const fs = require('fs');
const db = require('../config/db')

exports.getWidgets =  (req, res) => {
    fs.readFile('widgets.json', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading widgets file');
        }
        res.json(JSON.parse(data));
    });
}

exports.saveLayout =  (req, res) => {
    const layoutData = req.body.layoutData;
    db.query('UPDATE users SET dashboard_layout = ? WHERE id = ?', [layoutData, req.user.id], (err) => {
        if (err) {
            console.error('Error updating profile picture:', err.message);
            return res.status(500).json({ message: 'Error updating profile picture' });
        }

        res.status(200).json({ message: 'Layout updated successfully', layoutData: layoutData });
    });
}

exports.getLayout = async (req, res) => {
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
};