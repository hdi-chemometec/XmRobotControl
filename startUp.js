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
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconnectToClient = exports.reconnectToInstrument = exports.waitForRobotConnection = exports.getInstrumentState = exports.setInstrumentState = exports.getRobotState = exports.setRobotState = void 0;
const helperFunctions_1 = require("./helperFunctions/helperFunctions");
const RESTRobotFunctions_1 = require("./wsFunctions/RESTRobotFunctions");
const wsInstrumentFunctions_1 = require("./wsFunctions/wsInstrumentFunctions");
const wsClientFunctions_1 = require("./wsFunctions/wsClientFunctions");
const runState_1 = require("./Types/runState");
const instrumentStates_1 = require("./Types/instrumentStates");
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
 * waitForRobotConnection
 * @description function that waits for the robot to connect
 * The function is called in the startUp.ts file
 * The function is called recursively every 10 seconds until the robot's IP is found
 */
function waitForRobotConnection() {
    setTimeout(function () {
        const ipConnection = (0, helperFunctions_1.getIp)();
        console.log("Robot connection state: ", ipConnection);
        if (ipConnection == "") {
            console.log("Robot not connected");
            waitForRobotConnection();
        }
        else {
            console.log("Robot is connected");
            waitForServerConnection();
        }
    }, 10000);
}
exports.waitForRobotConnection = waitForRobotConnection;
/**
 * waitForServerConnection
 * @description function that waits for the python server to connect
 * The function is called recursively every 10 seconds until the python server is connected
 */
function waitForServerConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        const serverConnection = yield (0, RESTRobotFunctions_1.getServer)();
        setTimeout(function () {
            console.log("Python server connection state: ", serverConnection);
            if (!serverConnection) {
                console.log("Python server not connected");
                waitForServerConnection();
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
