const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    waitForConnections: true,
    queueLimit: 0
});

module.exports = db;