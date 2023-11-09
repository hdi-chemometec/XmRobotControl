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
exports.wsRunStatus = exports.wsRun = exports.wsPostRun = exports.wsGetProtocols = exports.wsGetRobot = exports.wsGetServer = exports.getIpAddress = void 0;
const axios_1 = __importDefault(require("axios")); // library used for making HTTP requests to servers. E.g. the flask server
const headers = {
    'Content-Type': 'application/json'
};
const pythonServer = "http://127.0.0.1:5000";
function getIpAddress() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(pythonServer + "/connect");
            console.log(response.status);
            console.log(response.data);
            if (response.status == 200) {
                console.log("Invoked python server to check if robot is connected");
            }
        }
        catch (error) {
            console.log("Axios error occurred ", error);
        }
    });
}
exports.getIpAddress = getIpAddress;
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
exports.wsGetServer = wsGetServer;
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
exports.wsGetRobot = wsGetRobot;
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
exports.wsGetProtocols = wsGetProtocols;
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
exports.wsPostRun = wsPostRun;
function wsRun(ws, protocol_id, command) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = { "protocol_id": protocol_id, "command": command };
            console.log(body);
            const response = yield axios_1.default.post(pythonServer + "/command", body, { headers: headers });
            console.log(response.status);
            console.log(response.data);
            if (response.status == 200) {
                const wsResponse = { type: "Command", payload: response.data };
                ws.send(JSON.stringify(wsResponse));
            }
            else {
                console.error(`Non-200 response from Flask ${response.status}`);
                const wsResponse = { type: "Command", payload: response.data };
                ws.send(JSON.stringify(wsResponse));
            }
        }
        catch (error) {
            console.error("Axios error occurred");
        }
    });
}
exports.wsRun = wsRun;
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
exports.wsRunStatus = wsRunStatus;
