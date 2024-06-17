const WebSocket = require('ws');
const mysql = require('mysql');

// Function to check the last record's status
function checkLastStatus() {
	const dateTime = new Date();
	server.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send('Status disconnected : ' + dateTime);
                    }
                });
                return;
    const query = 'SELECT status FROM net_log ORDER BY date_time DESC LIMIT 1';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return;
        }

        if (results.length > 0) {
            const lastStatus = results[0].status;

            if (lastStatus === 'disconnected') {
                // Send message to all connected android clients
                server.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send('Status disconnected');
                    }
                });
            }
        }
    });
}

function SyncMainServerToRestart(){
	// You shouold implemented the send restart request to your main server.
}

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mh'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    console.log('Connected to MySQL');
});

// WebSocket server setup
const server = new WebSocket.Server({ port: 8080 });

server.on('connection', socket => {
    console.log('Client connected');
	checkLastStatus();
	socket.on('message', message => {
	    console.log('Received:', message);
	    // Sync Server.
	    SyncMainServerToRestart();
	    
	    // Echo the message back to the android client
	    socket.send(`Server received: ${message}`);
	    
	  });
    // Handle client disconnection
    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is listening on ws://localhost:8080');

// Check the status every minute
setInterval(checkLastStatus, 60*1000);
