const bcrypt = require('bcrypt');
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'myveryveryseretcode';
const userUtils = require('../utils/userUtils')

exports.register = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role], (err) => {
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
}

exports.login = (req, res) => {
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
}

exports.uploadProfilePic = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or invalid file type' });
    }

    const profilePicPath = '/uploads/profile-pictures/' + req.file.filename;

    db.query('UPDATE users SET profile_picture = ? WHERE id = ?', [profilePicPath, req.user.id], (err) => {
        if (err) {
            console.error('Error updating profile picture:', err.message);
            return res.status(500).json({ message: 'Error updating profile picture' });
        }

        res.status(200).json({ message: 'Profile picture updated successfully', profilePicture: profilePicPath });
    });
}

exports.getUser = (req, res) => {
    db.query('SELECT id, username, role FROM users', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
}

exports.changeUserData = async (req, res) => {
    const userId = req.params.id;
    const role = req.body.role;
    const name = req.body.name;
    const password = req.body.password;
    const method = req.body.method;
    if (method) {
        if (method == "role") {
            if (userId && role) {
                db.query('UPDATE users SET role = ? WHERE id = ?', [role, userId], (err) => {
                    if (err) throw err;
                    res.json({ success: true });
                });
            } else {
                return res.status(400).json({ error: 'Please provide a userid and role' });
            }
        }
        if (method == "name") {
            if (userId && name) {
                db.query('UPDATE users SET username = ? WHERE id = ?', [name, userId], (err) => {
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
                    db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], (err) => {
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
}

exports.deleteUser = (req, res) => {
    const userId = req.params.id;
    db.query('DELETE FROM users WHERE id = ?', [userId], (err) => {
        if (err) throw err;
        res.json({ success: true });
    });
}

exports.getUserData = async (req, res) => {
    try {
        const userId = req.user.id;
        const userData = await userUtils.getUserData(userId); 
        console.log(userData);
        res.json({
            message: {
                username: userData.username,
                role: userData.role,
                profile_picture: userData.profile_picture || '/uploads/profile-pictures/default.jpg'
            }
        });
    } catch (err) {
        console.error('Error fetching user data:', err.message);
        res.status(500).json({ error: 'Failed to retrieve user data' });
    }
};


exports.changeName = (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;
    userUtils.changeName(name, userId, sucess => {
        if(sucess) {
            res.json({ success: true, message: 'Name updated successfully' });
        }else {
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        }
    });
}

exports.changePassword = async (req, res) => {
    const { password } = req.body;
    const userId = req.user.id;
    if(!password) {
        return res.status(400).json({ success: false, message: 'Password is required' });
    }
    userUtils.changePassword(password, userId, success => {
        if(success) {
            res.json({ success: true, message: 'Password updated successfully' });
        }else {
            res.status(500).json({ success: true, message: 'Internal Server Error' });
        }
    });
}