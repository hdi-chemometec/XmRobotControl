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
const express_1 = __importDefault(require("express")); // is a web app framework used for building APIs.
const axios_1 = __importDefault(require("axios")); // library used for making HTTP requests to servers. E.g. the flask server
const app = (0, express_1.default)();
const pythonServer = "http://127.0.0.1:5000";
const headers = {
    'Content-Type': 'application/json'
};
app.get("/server", get_server);
app.get("/protocols", get_protocols);
app.get("/runs", get_runs);
app.post("/runs", post_run);
app.post("/execute", post_execute);
app.get("/runStatus", get_runStatus);
app.get('/lights', get_lights);
app.post('/lights', post_lights);
function get_server(req, res) {
    console.log("Called get_server");
    axios_1.default
        .get(pythonServer + "/")
        .then((response) => {
        const responseJson = response.data;
        const responseString = responseJson.toString();
        return responseString;
    })
        .catch((error) => {
        console.error("Error occurred", error);
        return res.status(500).json({ error: "Internal Server Error" });
    });
}
function get_data(req) {
    console.log("Called get_data");
    return new Promise((resolve, reject) => {
        try {
            let data = '';
            req.on('data', (chunk) => {
                data += chunk.toString();
            });
            req.on('end', () => {
                req.body = JSON.parse(data);
                resolve(data);
            });
        }
        catch (error) {
            reject(error);
        }
    });
}
function get_protocols(req, res) {
    console.log("Called get_protocols");
    axios_1.default
        .get(pythonServer + "/protocols")
        .then((response) => {
        const responseJson = response.data;
        return res.json({ data: responseJson });
    })
        .catch((error) => {
        console.error("Error occurred", error);
        return res.status(500).json({ error: "Internal Server Error" });
    });
}
function get_runs(req, res) {
    console.log("Called get_runs");
    axios_1.default
        .get(pythonServer + "/runs")
        .then((response) => {
        const responseJson = response.data;
        return res.json({ data: responseJson });
    })
        .catch((error) => {
        console.error("Error occurred", error);
        return res.status(500).json({ error: "Internal Server Error" });
    });
}
function post_run(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Called post_run");
        const body = yield get_data(req);
        console.log(body);
        yield (0, axios_1.default)({
            method: 'post',
            url: pythonServer + "/runs",
            data: body,
            headers: headers
        }).then(response => {
            const responseJson = response.data;
            return res.json({ data: responseJson });
        })
            .catch((error) => {
            console.error("Error occurred", error);
            return res.status(500).json({ error: "Internal Server Error" });
        });
    });
}
function post_execute(req, res) {
    console.log("Called post_execute");
    axios_1.default
        .post(pythonServer + "/execute")
        .then((response) => {
        const responseJson = response.data;
        return res.json({ data: responseJson });
    })
        .catch((error) => {
        console.error("Error occurred", error);
        return res.status(500).json({ error: "Internal Server Error" });
    });
}
function get_runStatus(req, res) {
    console.log("Called get_runStatus");
    axios_1.default
        .get(pythonServer + "/runStatus")
        .then((response) => {
        const responseJson = response.data;
        return res.json({ data: responseJson });
    })
        .catch((error) => {
        console.error("Error occurred", error);
        return res.status(500).json({ error: "Internal Server Error" });
    });
}
function get_lights(req, res) {
    console.log("Called get_lights");
    axios_1.default.get(pythonServer + "/lights")
        .then((response) => {
        const responseJson = response.data;
        return res.json({ data: responseJson });
    })
        .catch((error) => {
        console.error("Error occurred", error);
        return res.status(500).json({ error: "Internal Server Error" });
    });
}
function post_lights(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Called post_lights");
        console.log("post lights");
        const body = yield get_data(req);
        console.log(body);
        (0, axios_1.default)({
            method: 'post',
            url: pythonServer + "/lights",
            data: body,
            headers: headers
        }).then(response => {
            const responseJson = response.data;
            return res.json({ data: responseJson });
        })
            .catch((error) => {
            console.error("Error occurred", error);
            return res.status(500).json({ error: "Internal Server Error" });
        });
    });
}
