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
const ws_1 = __importDefault(require("ws"));
const websocket_1 = require("websocket");
const discovery_client_1 = __importStar(require("@opentrons/discovery-client"));
const robot = new discovery_client_1.default();
let robotIP = "";
const WSPORT = 8084;
const headers = {
    'Content-Type': 'application/json'
};
function get_ip() {
    return robotIP;
}
function set_ip(ip) {
    robotIP = ip;
}
// functions used for getting the robot IP address:
robot.start();
robot.on(discovery_client_1.SERVICE_EVENT, (service) => {
    service.forEach((service) => {
        if (service.serverOk) {
            console.log("Ip address found: ", service.ip);
            if (service.ip != null) {
                set_ip(service.ip);
                console.log("Updated IP address: ", get_ip());
                updateRobotIP("true");
            }
        }
        else {
            console.log("No robot is connected");
            set_ip("");
            updateRobotIP("false");
        }
    });
});
robot.on(discovery_client_1.SERVICE_REMOVED_EVENT, (service) => {
    service.forEach((service) => {
        console.log("Ip address removed: ", service.ip);
        set_ip("");
        updateRobotIP("false");
    });
});
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 4000;
const app = (0, express_1.default)();
const clientInstance = new websocket_1.client();
const pythonServer = "http://127.0.0.1:5000";
app.get("/", (req, res) => {
    console.log("The current Ip Address is: ", get_ip());
    return res.send("Hello from Node server!");
});
app.get("/connect", (req, res) => {
    console.log("Called get_connection");
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    const tempId = get_ip();
    if (ipv4Pattern.test(tempId)) {
        // Check if it's a valid IPv4 address
        const parts = tempId.split('.');
        for (const part of parts) {
            const num = parseInt(part, 10);
            if (num < 0 || num > 255) {
                console.log("No robot is connected");
                return res.status(404).send('No robot IP address found. Make sure the robot is turned on!');
            }
        }
        console.log("Robot is connected", tempId);
        return res.status(200).json({ data: tempId });
    }
    else if (ipv6Pattern.test(tempId)) {
        // Check if it's a valid IPv6 address
        console.log("Robot is connected", tempId);
        return res.status(200).json({ data: tempId });
    }
    console.log("No robot is connected");
    return res.status(404).send('No robot IP address found. Make sure the robot is turned on!');
});
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
const wsServer = new ws_1.default.Server({ port: WSPORT });
wsServer.on('connection', (ws) => {
    console.log(`New client connected on PORT ${WSPORT}`);
    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        handleWsMessages(message, ws);
    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
function handleWsMessages(message, ws) {
    const json = JSON.parse(message);
    console.log(json.type);
    switch (json.type) {
        case "PING": {
            console.log("PING");
            const response = JSON.stringify({ type: "PING", payload: "PONG" });
            ws.send(response);
            break;
        }
        case "SERVER": {
            console.log("SERVER");
            wsGetServer(ws);
            break;
        }
        case "ROBOT": {
            console.log("ROBOT");
            wsGetRobot(ws);
            break;
        }
        case "PROTOCOLS": {
            console.log("PROTOCOLS");
            wsGetProtocols(ws);
            break;
        }
        case "RUN": {
            console.log("RUN");
            const protocol_id = json.protocol_id;
            wsPostRun(ws, protocol_id);
            break;
        }
        case "RUN_STATUS": {
            console.log("RUN_STATUS");
            wsRunStatus(ws);
            break;
        }
        default:
            console.log("Default");
            break;
    }
}
function wsGetServer(ws) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(pythonServer + "/");
            console.log(response.status);
            console.log(response.data);
            if (response.status == 200) {
                const wsResponse = { type: "Server", payload: response.data };
                ws.send(JSON.stringify(wsResponse));
            }
            else {
                const wsResponse = { type: "Server", payload: response.data };
                console.error(`Non-200 response from Flask ${response.status}`);
                ws.send(JSON.stringify(wsResponse));
            }
        }
        catch (error) {
            console.error("Axios error occurred");
        }
    });
}
function wsGetRobot(ws) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(pythonServer + "/connect");
            console.log(response.status);
            console.log(response.data);
            if (response.status == 200) {
                const wsResponse = { type: "Robot", payload: response.data };
                ws.send(JSON.stringify(wsResponse));
            }
            else {
                console.error(`Non-200 response from Flask ${response.status}`);
                const wsResponse = { type: "Robot", payload: response.data };
                ws.send(JSON.stringify(wsResponse));
            }
        }
        catch (error) {
            console.error("Axios error occurred");
        }
    });
}
function updateRobotIP(state) {
    const wsResponse = { type: "Robot", payload: `${state}` };
    wsServer.clients.forEach((client) => {
        if (client.readyState === ws_1.default.OPEN) {
            client.send(JSON.stringify(wsResponse));
        }
    });
}
function wsGetProtocols(ws) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(pythonServer + "/protocols");
            console.log(response.status);
            console.log(response.data);
            if (response.status == 200) {
                const wsResponse = { type: "Protocols", payload: response.data };
                ws.send(JSON.stringify(wsResponse));
            }
            else {
                console.error(`Non-200 response from Flask ${response.status}`);
                const wsResponse = { type: "Protocols", payload: response.data };
                ws.send(JSON.stringify(wsResponse));
            }
        }
        catch (error) {
            console.error("Axios error occurred");
        }
    });
}
function wsPostRun(ws, protocol_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = { "protocol_id": protocol_id };
            console.log(body);
            const response = yield axios_1.default.post(pythonServer + "/runs", body, { headers: headers });
            console.log(response.status);
            console.log(response.data);
            if (response.status == 201) {
                const wsResponse = { type: "Run", payload: response.data };
                ws.send(JSON.stringify(wsResponse));
            }
            else {
                console.error(`Non-201 response from Flask ${response.status}`);
                const wsResponse = { type: "Run", payload: response.data };
                ws.send(JSON.stringify(wsResponse));
            }
        }
        catch (error) {
            console.error("Axios error occurred");
        }
    });
}
function wsRunStatus(ws) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(pythonServer + "/runStatus");
            console.log(response.status);
            console.log(response.data);
            if (response.status == 200) {
                const wsResponse = { type: "RunStatus", payload: response.data };
                ws.send(JSON.stringify(wsResponse));
            }
        }
        catch (error) {
            console.error("Axios error occurred");
        }
    });
}
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
clientInstance.connect(`ws://0.0.0.0:${PORT}/ws`);
