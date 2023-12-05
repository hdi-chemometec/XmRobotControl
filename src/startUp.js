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
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconnectToClient = exports.reconnectToInstrument = exports.waitForRobotConnection = exports.startNodeServer = exports.getInstrumentState = exports.setInstrumentState = exports.getRobotState = exports.setRobotState = void 0;
const express_1 = __importDefault(require("express")); // is a web app framework used for building APIs.
const discovery_client_1 = __importStar(require("@opentrons/discovery-client"));
const RESTRobotFunctions_1 = require("./RESTRobotFunctions");
const wsInstrumentFunctions_1 = require("./wsInstrumentFunctions");
const wsClientFunctions_1 = require("./wsClientFunctions");
const runState_1 = require("../Types/runState");
const instrumentStates_1 = require("../Types/instrumentStates");
const RESTRobotFunctions_2 = require("./RESTRobotFunctions");
/**
 * robot
 * @description a new instance of the DiscoveryClient class
 * @type {DiscoveryClient}
 * It is used to handle events related to the robot connection to fetch the IP address of the robot
 */
const robot = new discovery_client_1.default();
// functions used for getting the robot IP address:
robot.start();
robot.on(discovery_client_1.SERVICE_EVENT, (service) => {
    service.forEach((service) => {
        if (service.serverOk) {
            console.log("Ip address found: ", service.ip);
            if (service.ip != null) {
                setIp(service.ip);
                (0, RESTRobotFunctions_2.informPythonServerIpUpdate)();
            }
        }
        else {
            console.log("No robot is connected");
        }
    });
});
robot.on(discovery_client_1.SERVICE_REMOVED_EVENT, (service) => {
    service.forEach((service) => {
        console.log("Ip address removed: ", service.ip);
        (0, RESTRobotFunctions_2.informPythonServerIpUpdate)();
    });
});
/**
 * robotState
 * @description variable describing the current state of the robot
 * @type {RobotStates}
 * @default RobotStates.UNKNOWN
 * setRobotState: sets the robotState variable
 * getRobotState: returns the robotState variable
 */
let robotState = runState_1.RobotStates.UNKNOWN;
const setRobotState = (newStatus) => {
    robotState = newStatus;
};
exports.setRobotState = setRobotState;
const getRobotState = () => {
    return robotState;
};
exports.getRobotState = getRobotState;
/**
 * instrumentState
 * @description variable describing the current state of the instrument
 * @type {InstrumentStates}
 * @default InstrumentStates.NO_STATE
 * setInstrumentState: sets the instrumentState variable
 * getInstrumentState: returns the instrumentState variable
 */
let instrumentState = instrumentStates_1.InstrumentStates.NO_STATE;
const setInstrumentState = (newStatus) => {
    instrumentState = newStatus;
};
exports.setInstrumentState = setInstrumentState;
const getInstrumentState = () => {
    return instrumentState;
};
exports.getInstrumentState = getInstrumentState;
/**
 * robotIP
 * @description variable used to store the robot's IP address
 * @type {string}
 * @default ""
 * getIp: returns the robotIP variable
 * setIp: sets the robotIP variable
 */
let robotIP = "";
function getIp() {
    if (robotIP != "") {
        return robotIP;
    }
    else {
        return "";
    }
}
function setIp(ip) {
    robotIP = ip;
}
/**
 * startNodeServer
 * @description function that starts the node server on port 4000
 */
function startNodeServer() {
    var _a;
    const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 4000;
    const app = (0, express_1.default)();
    app.get("/", (req, res) => {
        return res.send("Hello from Node server!");
    });
    //there should be made a call to the python server whenever the robot is connected
    app.get("/connect", (req, res) => {
        const tempIp = getIp();
        return res.status(200).json({ data: tempIp });
    });
    app.listen(PORT, () => {
        console.log(`⚡️[server]: REST server is running at http://localhost:${PORT}`);
    });
}
exports.startNodeServer = startNodeServer;
/**
 * waitForRobotConnection
 * @description function that waits for the robot to connect
 * The function is called in the startUp.ts file
 * The function is called recursively every 10 seconds until the robot's IP is found
 */
function waitForRobotConnection() {
    setTimeout(function () {
        const ipConnection = getIp();
        console.log("Robot connection state: ", ipConnection);
        if (ipConnection == "") {
            console.log("Robot not connected");
            waitForRobotConnection();
        }
        else {
            console.log("Robot is connected");
            waitForPythonServerConnection();
        }
    }, 10000);
}
exports.waitForRobotConnection = waitForRobotConnection;
/**
 * waitForServerConnection
 * @description function that waits for the python server to connect
 * The function is called recursively every 10 seconds until the python server is connected
 */
function waitForPythonServerConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        const serverConnection = yield (0, RESTRobotFunctions_1.getServer)();
        setTimeout(function () {
            console.log("Python server connection state: ", serverConnection);
            if (!serverConnection) {
                console.log("Python server not connected");
                waitForPythonServerConnection();
            }
            else {
                console.log("Python server is connected");
                (0, wsInstrumentFunctions_1.startInstrumentConnection)();
                waitForInstrumentConnection();
            }
        }, 10000);
    });
}
/**
 * waitForInstrumentConnection
 * @description function that waits for the instrument to connect
 * The function is called recursively every 10 seconds until the instrument is connected
 */
function waitForInstrumentConnection() {
    setTimeout(function () {
        const instrumentConnection = (0, wsInstrumentFunctions_1.getInstrumentConnection)();
        console.log("Instrument connection state: ", instrumentConnection);
        if (!instrumentConnection) {
            console.log("Instrument is not connected");
            (0, wsInstrumentFunctions_1.startInstrumentConnection)();
            waitForInstrumentConnection();
        }
        else {
            console.log("Instrument is connected");
            (0, wsClientFunctions_1.startClientServer)();
            waitForClientConnection();
        }
    }, 10000);
}
/**
 * waitForClientConnection
 * @description function that waits for the client to connect
 * The function is called recursively every 3 seconds until the client is connected
 */
function waitForClientConnection() {
    setTimeout(function () {
        const clientConnection = (0, wsClientFunctions_1.getWsClient)();
        console.log("Client connection state: ", clientConnection);
        if (!clientConnection) {
            console.log("Client is not connected");
            waitForClientConnection();
        }
        else {
            console.log("Client is connected");
        }
    }, 3000);
}
/**
 * reconnectToRobot
 * @description function that reconnects to the instrument, if the instrument is disconnected
 * The function is called recursively every 3 seconds until the instrument is reconnected
 */
function reconnectToInstrument() {
    setTimeout(function () {
        const instrumentConnection = (0, wsInstrumentFunctions_1.getInstrumentConnection)();
        console.log("Instrument connection state: ", instrumentConnection);
        if (!instrumentConnection) {
            console.log("Instrument is not connected");
            (0, wsInstrumentFunctions_1.startInstrumentConnection)(); //server is client so the instance must be restarted
            reconnectToInstrument();
        }
        else {
            console.log("Instrument is reconnected");
        }
    }, 3000);
}
exports.reconnectToInstrument = reconnectToInstrument;
/**
 * reconnectToClient
 * @description function that reconnects to the client, if the client is disconnected
 * The function is called recursively every 3 seconds until the client is reconnected
 */
function reconnectToClient() {
    setTimeout(function () {
        const clientConnection = (0, wsClientFunctions_1.getWsClient)();
        console.log("Client connection state: ", clientConnection);
        if (!clientConnection) {
            console.log("Client is not connected");
            reconnectToClient();
        }
        else {
            console.log("Client is reconnected");
        }
    }, 3000);
}
exports.reconnectToClient = reconnectToClient;
