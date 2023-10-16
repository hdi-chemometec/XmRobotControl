import express from 'express'; // is used for creating the HTTP server. It runs somewhere and responds to requests
import axios from 'axios'; // Is a HTTP client. It is used for creating web requests
import http from 'http';
const WebSocketClient = require('websocket').client;

const PORT = 80;
const app = express();
const server = http.createServer(app);

const client = new WebSocketClient();

const pythonServer = 'http://127.0.0.1:5000'


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/lightsOff', (req, res) => {
    axios.get(pythonServer+'/lights/false')
        .then((response) => {
        const responseJson = response.data;
        res.json({data: responseJson});
        })
        .catch((error: any) => {
        console.error("Error occured" , error);
        res.status(500).json({error: 'Internal Server Error'});
    });
});

app.get('/lightsOn', (req, res) => {
    axios.get(pythonServer+'/lights/true')
        .then((response) => {
        const responseJson = response.data;
        res.json({data: responseJson});
        })
        .catch((error: any) => {
        console.error("Error occurred" , error);
        res.status(500).json({error: 'Internal Server Error'});
    });
});

client.on('connectFailed', function(error: any) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection: any) {
    console.log('WebSocket Client Connected');
    sendState();

    connection.on('error', function(error: any) {
        console.log("Connection Error: " + error.toString());
    });


    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });

    
    connection.on('message', function(message: any) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
    
    function sendState() {
        if (connection.connected) {
            const json = JSON.stringify({ type:'STATE' });
            connection.sendUTF(json);
        }
    }

});

server.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

client.connect(`ws://0.0.0.0:${PORT}/ws`);