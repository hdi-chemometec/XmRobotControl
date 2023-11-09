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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // is a web app framework used for building APIs.
const discovery_client_1 = __importStar(require("@opentrons/discovery-client"));
const ws_robot_functions_1 = require("./ws_robot/ws_robot_functions");
const robot = new discovery_client_1.default();
let robotIP = "";
function get_ip() {
    return robotIP;
}
function set_ip(ip) {
    robotIP = ip;
}
// functions used for getting the robot IP address:
robot.start();
robot.on(discovery_client_1.SERVICE_EVENT, (service) => {
    service.forEach((service) => {
        if (service.serverOk) {
            console.log("Ip address found: ", service.ip);
            if (service.ip != null) {
                set_ip(service.ip);
                console.log("Updated IP address: ", get_ip());
                (0, ws_robot_functions_1.getIpAddress)();
            }
        }
        else {
            console.log("No robot is connected");
            set_ip("");
            (0, ws_robot_functions_1.getIpAddress)();
        }
    });
});
robot.on(discovery_client_1.SERVICE_REMOVED_EVENT, (service) => {
    service.forEach((service) => {
        console.log("Ip address removed: ", service.ip);
        set_ip("");
        (0, ws_robot_functions_1.getIpAddress)();
    });
});
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 4000;
const app = (0, express_1.default)();
app.get("/", (req, res) => {
    console.log("The current Ip Address is: ", get_ip());
    return res.send("Hello from Node server!");
});
//there should be made a call to the python server whenever the robot is connected
app.get("/connect", (req, res) => {
    console.log("Called get_connection");
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    const tempId = get_ip();
    if (ipv4Pattern.test(tempId)) {
        // Check if it's a valid IPv4 address
        const parts = tempId.split('.');
        for (const part of parts) {
            const num = parseInt(part, 10);
            if (num < 0 || num > 255) {
                console.log("No robot is connected");
                return res.status(404).send('No robot IP address found. Make sure the robot is turned on!');
            }
        }
        console.log("Robot is connected", tempId);
        return res.status(200).json({ data: tempId });
    }
    else if (ipv6Pattern.test(tempId)) {
        // Check if it's a valid IPv6 address
        console.log("Robot is connected", tempId);
        return res.status(200).json({ data: tempId });
    }
    console.log("No robot is connected");
    return res.status(404).send('No robot IP address found. Make sure the robot is turned on!');
});
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
