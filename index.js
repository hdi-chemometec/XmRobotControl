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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // is a web app framework used for building APIs.
const ws_1 = __importDefault(require("ws"));
const websocket_1 = require("websocket");
const discovery_client_1 = __importStar(require("@opentrons/discovery-client"));
const instrument_states_1 = require("./Types/instrument_states");
const ws_robot_functions_1 = require("./ws_robot_functions/ws_robot_functions");
const WSPORT = 8084;
const robot = new discovery_client_1.default();
let robotIP = "";
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
                (0, ws_robot_functions_1.getIpAddress)();
            }
        }
        else {
            console.log("No robot is connected");
            set_ip("");
            (0, ws_robot_functions_1.getIpAddress)();
        }
    });
});
robot.on(discovery_client_1.SERVICE_REMOVED_EVENT, (service) => {
    service.forEach((service) => {
        console.log("Ip address removed: ", service.ip);
        set_ip("");
        (0, ws_robot_functions_1.getIpAddress)();
    });
});
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 4000;
const app = (0, express_1.default)();
const clientInstance = new websocket_1.client();
app.get("/", (req, res) => {
    console.log("The current Ip Address is: ", get_ip());
    return res.send("Hello from Node server!");
});
//there should be made a call to the python server whenever the robot is connected
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
            (0, ws_robot_functions_1.wsGetServer)(ws);
            break;
        }
        case "ROBOT": {
            console.log("ROBOT");
            (0, ws_robot_functions_1.wsGetRobot)(ws);
            break;
        }
        case "PROTOCOLS": {
            console.log("PROTOCOLS");
            (0, ws_robot_functions_1.wsGetProtocols)(ws);
            break;
        }
        case "RUN": {
            console.log("RUN");
            const protocol_id = json.protocolId;
            (0, ws_robot_functions_1.wsPostRun)(ws, protocol_id);
            break;
        }
        case "RUN_STATUS": {
            console.log("RUN_STATUS");
            (0, ws_robot_functions_1.wsRunStatus)(ws);
            break;
        }
        case "COMMAND": {
            console.log("COMMAND");
            const protocol_id = json.protocol_id;
            const command = json.command;
            (0, ws_robot_functions_1.wsRun)(ws, protocol_id, command);
            break;
        }
        default:
            console.log("Default");
            break;
    }
}
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
//      Instrument Websocket functions     //
const Instrument_WS_PORT = 80;
let instrument_state = instrument_states_1.States.NO_STATE;
clientInstance.on("connectFailed", function (error) {
    console.log("Connect Error: " + error.toString());
});
clientInstance.on("connect", function (connection) {
    console.log("WebSocket Client Connected");
    transmitMessageState(connection);
    connection.on("error", function (error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on("close", function () {
        console.log("Connection closed");
    });
    connection.on("message", function (message) {
        handleReceivedMessage(message);
    });
});
function transmitMessageState(connection) {
    if (connection.connected) {
        const json = JSON.stringify({ type: "STATE" });
        connection.send(json);
    }
}
function handleReceivedMessage(message) {
    console.log("State message received: ", message);
    if (message.type === 'utf8') {
        const json = JSON.parse(message.utf8Data);
        switch (json.type) {
            case "State": {
                instrument_state = json.content;
                console.log("State: ", instrument_state);
                break;
            }
            default: {
                console.log("Default");
                break;
            }
        }
    }
}
clientInstance.connect(`ws://0.0.0.0:${Instrument_WS_PORT}/ws`);
