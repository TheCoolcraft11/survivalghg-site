const db = require('../config/db')

exports.setHighscore = (req, res) => {
    const { name, score } = req.body;

    if (!name || !score) {
        return res.status(400).send('Name und Score sind erforderlich.');
    }

    const query = 'INSERT INTO highscore (name, score) VALUES (?, ?)';

    db.query(query, [name, score], (err, results) => {
        if (err) {
            console.error('Fehler beim Einfügen des Highscores:', err.message);
            return res.status(500).send('Daten konnten nicht gespeichert werden.');
        }
        res.status(201).send(`Highscore gespeichert mit ID: ${results.insertId}`);
    });
}

exports.getTopHighscores =  (req, res) => {
    const query = 'SELECT * FROM highscore ORDER BY score DESC LIMIT ?';
    const limit = req.body.limit || 10;

    db.query(query, limit, (err, results) => {
        if (err) {
            console.error('Fehler beim Abrufen der Highscores:', err.message);
            return res.status(500).send('Fehler beim Abrufen der Highscores.');
        }

        res.status(200).json(results);
    });
}