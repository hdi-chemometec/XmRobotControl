"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const ws_robot_functions_1 = require("./ws_robot_functions");
/*            Client websocket functions            */
const Client_WS_PORT = 8084;
const wsServer = new ws_1.default.Server({ port: Client_WS_PORT });
wsServer.on('connection', (ws) => {
    console.log(`New client connected on PORT ${Client_WS_PORT}`);
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
