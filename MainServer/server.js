const express = require('express');
const mysql = require('mysql2');
const dns = require('dns');
const path = require('path');

const app = express();
const port = 3000;

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mh'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Function to check internet connection
function checkInternetConnection(callback) {
    dns.resolve('www.google.com', err => {
        callback(!err);
    });
}

// Function to log and update network status
let lastStatus = null;
function logConnectionStatus(isConnected) {
    const status = isConnected ? 'connected' : 'disconnected';
    const dateTime = new Date();
    const action = lastStatus !== status ? 'status_changed' : 'status_unchanged';
    const resolveDate = isConnected ? dateTime : null;

    if (lastStatus !== status) {
        db.query(
            'INSERT INTO net_log (date_time, status, action, resovle_date) VALUES (?, ?, ?, ?)',
            [dateTime, status, action, resolveDate],
            (err, results) => {
                if (err) throw err;
                console.log(`Logged status: ${status}`);
            }
        );
        lastStatus = status;
    }
}

// Endpoint to get the current network status
app.get('/status', (req, res) => {
    checkInternetConnection(isConnected => {
        res.json({ status: isConnected ? 'connected' : 'disconnected' });
    });
});

// Endpoint to get the status history with pagination
app.get('/history', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    db.query('SELECT COUNT(*) AS count FROM net_log', (err, result) => {
        if (err) throw err;
        const totalCount = result[0].count;
        const totalPages = Math.ceil(totalCount / limit);

        db.query(
            'SELECT * FROM net_log ORDER BY date_time DESC LIMIT ? OFFSET ?',
            [limit, offset],
            (err, results) => {
                if (err) throw err;
                res.json({ results, totalPages });
            }
        );
    });
});

// Serve the index.html as the default page
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Periodically check the network status every minute
setInterval(() => {
    checkInternetConnection(isConnected => {
        logConnectionStatus(isConnected);
    });
}, 60 * 1000); // 1 minute

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
