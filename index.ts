import express from 'express'; // is used for creating the HTTP server. It runs somewhere and responds to requests
import axios from 'axios'; // Is a HTTP client. It is used for creating web requests
import WebSocket from 'ws';
import http from 'http';

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const ws = new WebSocket.Server({ server }); 

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
        console.error("Error occured" , error);
        res.status(500).json({error: 'Internal Server Error'});
    });
});

ws.on('connection', async (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        console.log('Message received: ', message);
    });
    ws.send('Hello from server');
});

server.listen(3000, () => {
    console.log(`Server started on ${PORT} :`);
});