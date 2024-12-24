const db = require('../config/db')
const bcrypt = require('bcrypt');

function getUserData(id) {
    return new Promise((resolve, reject) => {
        db.query('SELECT username, role, profile_picture FROM users WHERE id = ?', [id], (err, results) => {
            if (err) {
                console.error('Error retrieving profile:', err.message);
                return reject(err); 
            }

            if (results.length === 0) {
                return reject(new Error('User not found')); 
            }

            const user = results[0];
            resolve(user); 
        });
    });
}

async function changeName(name, userId, callback) {
    db.query('UPDATE users SET username = ? WHERE id = ?', [name, userId], (err) => {
        if (err) {
            console.error('Error updating name:', err);
            callback(false);
        }
        callback(true);
    });
}
async function changePassword(password, userId, callback) {
    if (!password) {
        callback(false);
    }

    try {

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);


        db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err) => {
            if (err) {
                console.error('Error updating password:', err);
               callback(false);
            }
            callback(true)
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        callback(false)
    }
}

module.exports = {getUserData, changeName, changePassword}