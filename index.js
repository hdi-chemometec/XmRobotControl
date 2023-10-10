"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/lightsOff', (req, res) => {
    axios_1.default.get('http://127.0.0.1:5000/lights/false')
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
    axios_1.default.get('http://127.0.0.1:5000/lights/true')
        .then((response) => {
        const responseJson = response.data;
        res.json({ data: responseJson });
    })
        .catch((error) => {
        console.error("Error occured", error);
        res.status(500).json({ error: 'Internal Server Error' });
    });
});
app.listen(8080, () => {
    console.log('App listening on port 8080!');
});
