"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessageToClient = exports.startClientServer = exports.getWsClient = void 0;
const ws_1 = __importDefault(require("ws"));
const RESTRobotFunctions_1 = require("./RESTRobotFunctions");
const wsInstrumentFunctions_1 = require("./wsInstrumentFunctions");
const flowControl_1 = require("../helperFunctions/flowControl");
const startUp_1 = require("../startUp");
/*            Client websocket functions            */
let wsClient = false;
const connectedClients = new Set();
function getWsClient() {
    return wsClient;
}
exports.getWsClient = getWsClient;
function setWsClient(state) {
    wsClient = state;
}
function startClientServer() {
    const CLIENT_WS_PORT = 8084;
    const wsServer = new ws_1.default.Server({ port: CLIENT_WS_PORT });
    wsServer.on('connection', (ws) => {
        console.log(`New client connected on PORT ${CLIENT_WS_PORT}`);
        setWsClient(true);
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
            (0, RESTRobotFunctions_1.wsRunStatus)(ws);
        }
        setInterval(fetchRunStatus, 2000);
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
                    (0, RESTRobotFunctions_1.wsGetServer)(ws);
                    break;
                }
                case "ROBOT": {
                    (0, RESTRobotFunctions_1.wsGetRobot)(ws);
                    break;
                }
                case "PROTOCOLS": {
                    (0, RESTRobotFunctions_1.wsGetProtocols)(ws);
                    break;
                }
                case "RUN": {
                    const protocolId = json.protocolId;
                    (0, RESTRobotFunctions_1.wsPostRun)(ws, protocolId);
                    break;
                }
                case "RUN_STATUS": {
                    (0, RESTRobotFunctions_1.wsRunStatus)(ws);
                    break;
                }
                case "COMMAND": {
                    const protocolId = json.protocolId;
                    const command = json.command;
                    if ((0, flowControl_1.shouldFlowStart)()) {
                        console.log("Flow should start");
                        (0, RESTRobotFunctions_1.wsRun)(ws, protocolId, command);
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
                    (0, wsInstrumentFunctions_1.fromServerSendMessageToInstrument)("STATE");
                    break;
                }
                default:
                    console.log("handleWsMessages: WS client Default");
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
