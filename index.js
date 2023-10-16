"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // is used for creating the HTTP server. It runs somewhere and responds to requests
const axios_1 = __importDefault(require("axios")); // Is a HTTP client. It is used for creating web requests
const http_1 = __importDefault(require("http"));
const WebSocketClient = require('websocket').client;
const PORT = 80;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const client = new WebSocketClient();
const pythonServer = 'http://127.0.0.1:5000';
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/lightsOff', (req, res) => {
    axios_1.default.get(pythonServer + '/lights/false')
        .then((response) => {
        const responseJson = response.data;
        res.json({ data: responseJson });
    })
        .catch((error) => {
        console.error("Error occured", error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});
app.get('/lightsOn', (req, res) => {
    axios_1.default.get(pythonServer + '/lights/true')
        .then((response) => {
        const responseJson = response.data;
        res.json({ data: responseJson });
    })
        .catch((error) => {
        console.error("Error occurred", error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});
client.on('connectFailed', function (error) {
    console.log('Connect Error: ' + error.toString());
});
client.on('connect', function (connection) {
    console.log('WebSocket Client Connected');
    sendState();
    connection.on('error', function (error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function () {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
    function sendState() {
        if (connection.connected) {
            const json = JSON.stringify({ type: 'STATE' });
            connection.sendUTF(json);
        }
    }
});
server.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
client.connect(`ws://0.0.0.0:${PORT}/ws`);
