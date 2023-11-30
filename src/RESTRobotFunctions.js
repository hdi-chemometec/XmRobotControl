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
exports.wsRunStatus = exports.sendCommand = exports.wsRun = exports.wsPostRun = exports.wsGetProtocols = exports.wsGetRobot = exports.wsGetServer = exports.getServer = exports.informPythonServerIpUpdate = void 0;
const axios_1 = __importDefault(require("axios")); // library used for making HTTP requests to servers. E.g. the flask server
const startUp_1 = require("./startUp");
const runState_1 = require("../Types/runState");
/**
 * headers
 * @description variable used to store the headers for the HTTP requests
 */
const headers = {
    'Content-Type': 'application/json'
};
/**
 * PYTHON_SERVER
 * @description variable used to store the URL of the python server
 */
const PYTHON_SERVER = "http://127.0.0.1:5000";
/**
 * informPythonServerIpUpdate
 * @description function that invokes the python server to check for the robot's IP address
 * This function is used when an IP address is found or removed
 */
function informPythonServerIpUpdate() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(PYTHON_SERVER + "/connect");
            if (response.status == 200) {
                console.log("Invoked python server to check if robot is connected");
            }
        }
        catch (error) {
            console.log("informPythonServerIpUpdate: Error, Python server is not running");
        }
    });
}
exports.informPythonServerIpUpdate = informPythonServerIpUpdate;
/**
 * getServer
 * @returns {boolean} connection state of the python server
 * @description function that returns the connection state of the python server
 * This function is used when the node server checks the connection state of the python server
 */
const getServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(PYTHON_SERVER + "/");
        if (response.status == 200) {
            console.log(`Python server is running ${response.status}`);
            return true;
        }
        else {
            console.log(`Non-200 response from Flask ${response.status}`);
            return false;
        }
    }
    catch (error) {
        console.error("getServer: Error, Python server is not running");
        return false;
    }
});
exports.getServer = getServer;
/**
 * wsGetServer
 * @param ws - websocket instance
 * This function gets the python connection state and sends it's state as a response to the ws client
 * if it fails to get the connection state, it sends the request back to the ws client
 */
function wsGetServer(ws) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(PYTHON_SERVER + "/");
            if (response.status == 200) {
                const wsResponse = { type: "SERVER", content: response.data };
                ws.send(JSON.stringify(wsResponse));
            }
            else {
                const wsResponse = { type: "SERVER", content: response.data };
                console.error(`Non-200 response from Flask ${response.status}`);
                ws.send(JSON.stringify(wsResponse));
            }
        }
        catch (error) {
            console.error("wsGetServer: Error, Axios error occurred");
        }
    });
}
exports.wsGetServer = wsGetServer;
/**
 * wsGetRobot
 * @param ws - websocket instance
 * This function gets the robot connection state and sends it's state as a response to the ws client
 * if it fails to get the connection state, it sends the request back to the ws client
 */
function wsGetRobot(ws) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(PYTHON_SERVER + "/connect");
            if (response.status == 200) {
                const wsResponse = { type: "ROBOT", content: response.data };
                ws.send(JSON.stringify(wsResponse));
                return true;
            }
            else {
                console.error(`Non-200 response from Flask ${response.status}`);
                const wsResponse = { type: "ROBOT", content: response.data };
                ws.send(JSON.stringify(wsResponse));
                return false;
            }
        }
        catch (error) {
            console.error("wsGetRobot: Error, Axios error occurred");
            return false;
        }
    });
}
exports.wsGetRobot = wsGetRobot;
/**
 *
 * @param ws - websocket instance
 * This function gets the robot protocol list and sends it as a response to the ws client
 * if it fails to get the protocol list, it sends the request back to the ws client
 */
function wsGetProtocols(ws) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(PYTHON_SERVER + "/protocols");
            if (response.status == 200) {
                const wsResponse = { type: "PROTOCOLS", content: response.data };
                ws.send(JSON.stringify(wsResponse));
            }
            else {
                console.error(`Non-200 response from Flask ${response.status}`);
                const wsResponse = { type: "PROTOCOLS", content: response.data };
                ws.send(JSON.stringify(wsResponse));
            }
        }
        catch (error) {
            console.error("wsGetProtocols: Error, Axios error occurred");
        }
    });
}
exports.wsGetProtocols = wsGetProtocols;
/**
 * wsPostRun
 * @param ws - websocket instance
 * @param protocol_id - protocol id of the protocol to be run
 * This function posts a run request to the python server and sends the response to the ws client
 * if it fails to post the run request, it sends the request back to the ws client
 */
function wsPostRun(ws, protocol_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = { "protocol_id": protocol_id };
            const response = yield axios_1.default.post(PYTHON_SERVER + "/runs", body, { headers: headers });
            if (response.status == 201) {
                const wsResponse = { type: "RUN", content: response.data };
                ws.send(JSON.stringify(wsResponse));
            }
            else {
                console.error(`Non-201 response from Flask ${response.status}`);
                const wsResponse = { type: "RUN", content: response.data };
                ws.send(JSON.stringify(wsResponse));
            }
        }
        catch (error) {
            console.error("wsPostRun: Error, Axios error occurred");
        }
    });
}
exports.wsPostRun = wsPostRun;
/**
 * wsRun
 * @param ws - websocket instance
 * @param protocol_id - protocol id of the protocol to be run
 * @param command - command to be sent to the robot
 * This function posts a command to the python server and sends the response to the ws client
 * if it fails to post the command, it sends the request back to the ws client
 */
function wsRun(ws, protocol_id, command) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = { "protocol_id": protocol_id, "command": command };
            const response = yield axios_1.default.post(PYTHON_SERVER + "/command", body, { headers: headers });
            if (response.status == 201) {
                console.log("Command sent to robot");
                const wsResponse = { type: "COMMAND", content: response.data };
                ws.send(JSON.stringify(wsResponse));
            }
            else {
                console.error(`Non-201 response from Flask ${response.status}`);
                const wsResponse = { type: "COMMAND", content: response.data };
                ws.send(JSON.stringify(wsResponse));
            }
        }
        catch (error) {
            console.error("wsRun: Error, Axios error occurred");
        }
    });
}
exports.wsRun = wsRun;
/**
 * sendCommand
 * @param command - command to be sent to the robot
 * This function posts a command to the python server
 * if it fails to post the command, it sends the request back to the ws client
 */
function sendCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = { "command": command };
            const response = yield axios_1.default.post(PYTHON_SERVER + "/command", body, { headers: headers });
            if (response.status == 201) {
                console.log("Command sent to robot");
                const wsResponse = { type: "COMMAND", content: response.data };
                console.log(wsResponse);
            }
            else {
                console.error(`Non-201 response from Flask ${response.status}`);
                const wsResponse = { type: "COMMAND", content: response.data };
                console.error(wsResponse);
            }
        }
        catch (error) {
            console.error("sendCommand: Error, Axios error occurred");
        }
    });
}
exports.sendCommand = sendCommand;
/**
 * wsRunStatus
 * @param ws - websocket instance
 * This function gets the robot run status and sends it as a response to the ws client
 * if it fails to get the run status, it returns the state UNKNOWN
 */
function wsRunStatus(ws) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(PYTHON_SERVER + "/runStatus");
            if (response.status == 200) {
                const wsResponse = { type: "RUN_STATUS", content: response.data };
                (0, startUp_1.setRobotState)(response.data);
                ws.send(JSON.stringify(wsResponse));
            }
            else {
                const wsResponse = { type: "RUN_STATUS", content: runState_1.RobotStates.UNKNOWN };
                ws.send(JSON.stringify(wsResponse));
            }
        }
        catch (error) {
            console.error("wsRunStatus: Error, Axios error occurred");
        }
    });
}
exports.wsRunStatus = wsRunStatus;
