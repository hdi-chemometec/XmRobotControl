"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageToClient = exports.startClientServer = exports.getWsClient = void 0;
const ws_1 = __importDefault(require("ws"));
const REST_robot_functions_1 = require("./REST_robot_functions");
const ws_instrument_functions_1 = require("./ws_instrument_functions");
const flowControl_1 = require("../helper_functions/flowControl");
const startUp_1 = require("../startUp");
/*            Client websocket functions            */
let wsClient = false;
const connectedClients = new Set();
let globalWs;
function getWsClient() {
    return wsClient;
}
exports.getWsClient = getWsClient;
function setWsClient(state) {
    wsClient = state;
}
function startClientServer() {
    const Client_WS_PORT = 8084;
    const wsServer = new ws_1.default.Server({ port: Client_WS_PORT });
    wsServer.on('connection', (ws) => {
        console.log(`New client connected on PORT ${Client_WS_PORT}`);
        setWsClient(true);
        globalWs = ws;
        connectedClients.add(ws);
        ws.on('message', (message) => {
            console.log(`Received message: ${message}`);
            handleWsMessages(message, ws);
        });
        ws.on('close', () => {
            console.log('Client disconnected');
            setWsClient(false);
            (0, startUp_1.reconnectToClient)();
        });
        function fetchRunStatus() {
            (0, REST_robot_functions_1.wsRunStatus)(globalWs);
        }
        setInterval(fetchRunStatus, 1000);
        function handleWsMessages(message, ws) {
            const json = JSON.parse(message);
            console.log("Received message from client: ", json.type);
            switch (json.type) {
                case "PING": {
                    const response = JSON.stringify({ type: "PING", content: "PONG" });
                    ws.send(response);
                    break;
                }
                case "SERVER": {
                    (0, REST_robot_functions_1.wsGetServer)(ws);
                    break;
                }
                case "ROBOT": {
                    (0, REST_robot_functions_1.wsGetRobot)(ws);
                    break;
                }
                case "PROTOCOLS": {
                    (0, REST_robot_functions_1.wsGetProtocols)(ws);
                    break;
                }
                case "RUN": {
                    const protocol_id = json.protocolId;
                    (0, REST_robot_functions_1.wsPostRun)(ws, protocol_id);
                    break;
                }
                case "RUN_STATUS": {
                    (0, REST_robot_functions_1.wsRunStatus)(ws);
                    break;
                }
                case "COMMAND": {
                    const protocol_id = json.protocolId;
                    const command = json.command;
                    if ((0, flowControl_1.shouldFlowStart)()) {
                        console.log("Flow should start");
                        (0, REST_robot_functions_1.wsRun)(ws, protocol_id, command);
                        console.log("CONTROL BEGINS");
                        (0, flowControl_1.startControlFlow)();
                    }
                    else {
                        console.log("Flow should not start");
                        const response = JSON.stringify({ type: "COMMAND", content: "stop" });
                        ws.send(response);
                    }
                    break;
                }
                case "STATE": {
                    (0, ws_instrument_functions_1.fromServerSendMessageToInstrument)("STATE");
                    break;
                }
                default:
                    console.log("Default");
                    break;
            }
        }
    });
}
exports.startClientServer = startClientServer;
const sendMessageToClient = function (data) {
    try {
        const jsonString = JSON.stringify(data);
        connectedClients.forEach((client) => {
            console.log("Sending message to client: ", jsonString);
            client.send(jsonString);
        });
    }
    catch (error) {
        console.error("Client is not connected");
    }
};
exports.sendMessageToClient = sendMessageToClient;
