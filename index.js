"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // is a web app framework used for building APIs.
const axios_1 = __importDefault(require("axios")); // library used for making HTTP requests to servers. E.g. the flask server
const websocket_1 = require("websocket");
const discovery_client_1 = __importStar(require("@opentrons/discovery-client"));
const robot = new discovery_client_1.default();
let robotIP = "";
// functions used for getting the robot IP address:
robot.start();
robot.on(discovery_client_1.SERVICE_EVENT, (service) => {
    service.forEach((service) => {
        console.log("Ip address found: ", service.ip);
        if (service.ip != null) {
            robotIP = service.ip;
        }
    });
});
robot.on(discovery_client_1.SERVICE_REMOVED_EVENT, (service) => {
    service.forEach((service) => {
        console.log("Ip address removed: ", service.ip);
        robotIP = "";
    });
});
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 80;
const app = (0, express_1.default)();
const clientInstance = new websocket_1.client();
const pythonServer = "http://127.0.0.1:5000";
const headers = {
    'Content-Type': 'application/json'
};
app.get("/", (req, res) => {
    console.log("The current Ip Address is: ", robotIP);
    return res.send("Hello from Node server!");
});
app.get("/connect", get_connection);
app.get("/server", get_server);
app.get("/protocols", get_protocols);
app.get("/runs", get_runs);
app.post("/runs", post_run);
app.post("/execute", post_execute);
app.get("/runStatus", get_runStatus);
app.get('/lights', get_lights);
app.post('/lights', post_lights);
function get_connection(req, res) {
    console.log("Called get_connection");
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    if (ipv4Pattern.test(robotIP)) {
        // Check if it's a valid IPv4 address
        const parts = robotIP.split('.');
        for (const part of parts) {
            const num = parseInt(part, 10);
            if (num < 0 || num > 255) {
                return res.status(404).send('No robot IP address found. Make sure the robot is turned on!');
            }
        }
        return res.status(200).json({ data: robotIP });
    }
    else if (ipv6Pattern.test(robotIP)) {
        // Check if it's a valid IPv6 address
        return res.status(200).json({ data: robotIP });
    }
    return res.status(404).send('No robot IP address found. Make sure the robot is turned on!');
}
function get_server(req, res) {
    console.log("Called get_server");
    axios_1.default
        .get(pythonServer + "/")
        .then((response) => {
        const responseJson = response.data;
        return res.json({ data: responseJson });
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
//      Websocket functions     //
clientInstance.on("connectFailed", function (error) {
    console.log("Connect Error: " + error.toString());
});
clientInstance.on("connect", function (connection) {
    console.log("WebSocket Client Connected");
    sendState();
    connection.on("error", function (error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on("close", function () {
        console.log("Connection closed");
    });
    connection.on("message", function (message) {
        if (message.type === "utf8") {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
    function sendState() {
        if (connection.connected) {
            const json = JSON.stringify({ type: "STATE" });
            connection.sendUTF(json);
        }
    }
});
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
clientInstance.connect(`ws://0.0.0.0:${PORT}/ws`);
