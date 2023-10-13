"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // is used for creating the HTTP server. It runs somewhere and responds to requests
const axios_1 = __importDefault(require("axios")); // Is a HTTP client. It is used for creating web requests
const ws_1 = __importDefault(require("ws"));
const http_1 = __importDefault(require("http"));
const PORT = 3000;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const ws = new ws_1.default.Server({ server });
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
        console.error("Error occured", error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});
ws.on('connection', (ws) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Client connected');
    ws.on('message', (message) => {
        console.log('Message received: ', message);
    });
    ws.send('Hello from server');
}));
server.listen(3000, () => {
    console.log(`Server started on ${PORT} :`);
});
