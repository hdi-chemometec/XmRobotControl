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
const index_1 = require("../index");
const runState_1 = require("../Types/runState");
const headers = {
    'Content-Type': 'application/json'
};
const pythonServer = "http://127.0.0.1:5000";
function informPythonServerIpUpdate() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(pythonServer + "/connect");
            if (response.status == 200) {
                console.log("Invoked python server to check if robot is connected");
            }
        }
        catch (error) {
            console.log("Python server is not running");
        }
    });
}
exports.informPythonServerIpUpdate = informPythonServerIpUpdate;
const getServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(pythonServer + "/");
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
        console.error("Python server is not running");
        return false;
    }
});
exports.getServer = getServer;
function wsGetServer(ws) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(pythonServer + "/");
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
            console.error("Axios error occurred");
        }
    });
}
exports.wsGetServer = wsGetServer;
function wsGetRobot(ws) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(pythonServer + "/connect");
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
            console.error("Axios error occurred");
            return false;
        }
    });
}
exports.wsGetRobot = wsGetRobot;
function wsGetProtocols(ws) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(pythonServer + "/protocols");
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
            console.error("Axios error occurred");
        }
    });
}
exports.wsGetProtocols = wsGetProtocols;
function wsPostRun(ws, protocol_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = { "protocol_id": protocol_id };
            const response = yield axios_1.default.post(pythonServer + "/runs", body, { headers: headers });
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
            console.error("Axios error occurred");
        }
    });
}
exports.wsPostRun = wsPostRun;
function wsRun(ws, protocol_id, command) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = { "protocol_id": protocol_id, "command": command };
            const response = yield axios_1.default.post(pythonServer + "/command", body, { headers: headers });
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
            console.error("Axios error occurred");
        }
    });
}
exports.wsRun = wsRun;
function sendCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = { "command": command };
            const response = yield axios_1.default.post(pythonServer + "/command", body, { headers: headers });
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
            console.error("Axios error occurred");
        }
    });
}
exports.sendCommand = sendCommand;
function wsRunStatus(ws) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(pythonServer + "/runStatus");
            if (response.status == 200) {
                const wsResponse = { type: "RUN_STATUS", content: response.data };
                (0, index_1.setRobotState)(response.data);
                ws.send(JSON.stringify(wsResponse));
            }
        }
        catch (error) {
            const wsResponse = { type: "RUN_STATUS", content: runState_1.RobotStates.UNKNOWN };
            ws.send(JSON.stringify(wsResponse));
        }
    });
}
exports.wsRunStatus = wsRunStatus;
