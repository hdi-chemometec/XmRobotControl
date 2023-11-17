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
exports.waitForInstrumentConnection = exports.waitForServerConnection = exports.waitForRobotConnection = exports.getInstrumentState = exports.setInstrumentState = exports.getRobotState = exports.setRobotState = void 0;
const helperFunctions_1 = require("./helper_functions/helperFunctions");
const REST_robot_functions_1 = require("./ws_functions/REST_robot_functions");
const ws_instrument_functions_1 = require("./ws_functions/ws_instrument_functions");
const ws_client_functions_1 = require("./ws_functions/ws_client_functions");
const runState_1 = require("./Types/runState");
const instrumentStates_1 = require("./Types/instrumentStates");
let robotState = runState_1.RobotStates.UNKNOWN;
const setRobotState = (newStatus) => {
    robotState = newStatus;
};
exports.setRobotState = setRobotState;
const getRobotState = () => {
    return robotState;
};
exports.getRobotState = getRobotState;
let instrumentState = instrumentStates_1.InstrumentStates.NO_STATE;
const setInstrumentState = (newStatus) => {
    instrumentState = newStatus;
};
exports.setInstrumentState = setInstrumentState;
const getInstrumentState = () => {
    return instrumentState;
};
exports.getInstrumentState = getInstrumentState;
function waitForRobotConnection() {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
exports.waitForRobotConnection = waitForRobotConnection;
function waitForServerConnection() {
    setTimeout(function () {
        const serverConnection = (0, REST_robot_functions_1.getServer)();
        console.log("Python server connection state: ", serverConnection);
        if (!serverConnection) {
            console.log("Python server not connected");
            waitForServerConnection();
        }
        else {
            console.log("Python server is connected");
            (0, ws_instrument_functions_1.startInstrumentConnection)();
            waitForInstrumentConnection();
        }
    }, 10000);
}
exports.waitForServerConnection = waitForServerConnection;
function waitForInstrumentConnection() {
    setTimeout(function () {
        const instrumentConnection = (0, ws_instrument_functions_1.getInstrumentConnection)();
        console.log("Instrument connection state: ", instrumentConnection);
        if (!instrumentConnection) {
            console.log("Instrument is not connected");
            waitForInstrumentConnection();
        }
        else {
            console.log("Instrument is connected");
            (0, ws_client_functions_1.startClientServer)();
            waitForClientConnection();
        }
    }, 10000);
}
exports.waitForInstrumentConnection = waitForInstrumentConnection;
function waitForClientConnection() {
    setTimeout(function () {
        const clientConnection = (0, ws_client_functions_1.getWsClient)();
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
