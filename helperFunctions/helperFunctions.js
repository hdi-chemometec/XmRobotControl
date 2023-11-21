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
Object.defineProperty(exports, "__esModule", { value: true });
exports.startNodeServer = exports.getIp = void 0;
const RESTRobotFunctions_1 = require("../wsFunctions/RESTRobotFunctions");
const express_1 = __importDefault(require("express")); // is a web app framework used for building APIs.
const discovery_client_1 = __importStar(require("@opentrons/discovery-client"));
const robot = new discovery_client_1.default();
let robotIP = "";
// functions used for getting the robot IP address:
robot.start();
robot.on(discovery_client_1.SERVICE_EVENT, (service) => {
    service.forEach((service) => {
        if (service.serverOk) {
            console.log("Ip address found: ", service.ip);
            if (service.ip != null) {
                set_ip(service.ip);
                (0, RESTRobotFunctions_1.informPythonServerIpUpdate)();
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
        (0, RESTRobotFunctions_1.informPythonServerIpUpdate)();
    });
});
function get_ip() {
    return robotIP;
}
function set_ip(ip) {
    robotIP = ip;
}
function getIp() {
    if (robotIP != "") {
        return robotIP;
    }
    else {
        return "";
    }
}
exports.getIp = getIp;
function startNodeServer() {
    var _a;
    const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 4000;
    const app = (0, express_1.default)();
    app.get("/", (req, res) => {
        console.log("The current Ip Address is: ", get_ip());
        return res.send("Hello from Node server!");
    });
    //there should be made a call to the python server whenever the robot is connected
    app.get("/connect", (req, res) => {
        const tempIp = get_ip();
        console.log("The current Ip Address is: ", tempIp);
        return res.status(200).json({ data: tempIp });
    });
    app.listen(PORT, () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
    });
}
exports.startNodeServer = startNodeServer;
