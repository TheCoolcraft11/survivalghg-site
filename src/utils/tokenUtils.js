const jwt = require('jsonwebtoken');
const JWT_SECRET = 'myveryveryseretcode';

function readToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];


    jwt.verify(token, JWT_SECRET, (err, user) => {
        req.user = user;
        next();
    });
}
module.exports = readToken();