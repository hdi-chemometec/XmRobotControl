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
const axios_1 = __importDefault(require("axios")); // library used for making HTTP requests to servers. E.g. the flask server
const body_parser_1 = __importDefault(require("body-parser"));
const websocket_1 = require("websocket");
const discovery_client_1 = __importStar(require("@opentrons/discovery-client"));
const robot = new discovery_client_1.default();
let robotIP = "";
// functions used for getting the robot IP address:
robot.start();
robot.on(discovery_client_1.SERVICE_EVENT, (service) => {
    //console.log("Service found: ", service);
    service.forEach((service) => {
        console.log("Ip address found: ", service.ip);
        if (service.ip != null) {
            robotIP = service.ip;
        }
    });
});
robot.on(discovery_client_1.SERVICE_REMOVED_EVENT, (service) => {
    //console.log("Service removed: ", service);
    service.forEach((service) => {
        console.log("Ip address removed: ", service.ip);
        robotIP = "";
    });
});
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 80;
const app = (0, express_1.default)();
const clientInstance = new websocket_1.client();
const pythonServer = "http://127.0.0.1:5000";
app.use(body_parser_1.default.json());
app.get("/", (req, res) => {
    res.send("Hello from Node server!");
});
app.get("/connect", connect);
app.get("/server", server);
app.get("/protocols", protocols);
app.get("/runs", runs);
app.post("/execute", execute);
app.get("/runStatus", runStatus);
app.get('/lights', lights);
app.get("/lightsOff", lightsOff);
app.get("/lightsOn", lightsOn);
// test protocol 4cc224a7-f47c-40db-8eef-9f791c689fab
app.post("/add/:protocolId", (req, res) => {
    const protocolId = String(req.params.protocolId);
    console.log(protocolId);
    axios_1.default
        .post(pythonServer + "/runs/" + protocolId)
        .then((response) => {
        const responseJson = response.data;
        res.json({ data: responseJson });
    })
        .catch((error) => {
        console.error("Error occurred", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
});
function connect(req, res) {
    if (robotIP != "") {
        res.json({ data: robotIP });
        res.status(200).send();
    }
    else {
        res.status(404).send('No robot IP address found. Make sure the robot is turned on!');
    }
}
function server(req, res) {
    axios_1.default
        .get(pythonServer + "/")
        .then((response) => {
        const responseJson = response.data;
        res.json({ data: responseJson });
    })
        .catch((error) => {
        console.error("Error occurred", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
}
function protocols(req, res) {
    axios_1.default
        .get(pythonServer + "/protocols")
        .then((response) => {
        const responseJson = response.data;
        res.json({ data: responseJson });
    })
        .catch((error) => {
        console.error("Error occurred", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
}
function runs(req, res) {
    axios_1.default
        .get(pythonServer + "/runs")
        .then((response) => {
        const responseJson = response.data;
        res.json({ data: responseJson });
    })
        .catch((error) => {
        console.error("Error occurred", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
}
function execute(req, res) {
    axios_1.default
        .post(pythonServer + "/execute/")
        .then((response) => {
        const responseJson = response.data;
        res.json({ data: responseJson });
    })
        .catch((error) => {
        console.error("Error occurred", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
}
function runStatus(req, res) {
    axios_1.default
        .get(pythonServer + "/runStatus/")
        .then((response) => {
        const responseJson = response.data;
        res.json({ data: responseJson });
    })
        .catch((error) => {
        console.error("Error occurred", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
}
function lights(req, res) {
    axios_1.default.get(pythonServer + "/lights")
        .then((response) => {
        const responseJson = response.data;
        res.json({ data: responseJson });
    })
        .catch((error) => {
        console.error("Error occurred", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
}
function lightsOff(req, res) {
    axios_1.default
        .get(pythonServer + "/lights/false")
        .then((response) => {
        const responseJson = response.data;
        res.json({ data: responseJson });
    })
        .catch((error) => {
        console.error("Error occurred", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
}
function lightsOn(req, res) {
    axios_1.default
        .get(pythonServer + "/lights/true")
        .then((response) => {
        const responseJson = response.data;
        res.json({ data: responseJson });
    })
        .catch((error) => {
        console.error("Error occurred", error);
        res.status(500).json({ error: "Internal Server Error" });
    });
}
//      Websocket functions     //
clientInstance.on("connectFailed", function (error) {
    console.log("Connect Error: " + error.toString());
});
clientInstance.on("connect", function (connection) {
    console.log("WebSocket Client Connected");
    sendState();
    connection.on("error", function (error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on("close", function () {
        console.log("Connection closed");
    });
    connection.on("message", function (message) {
        if (message.type === "utf8") {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
    function sendState() {
        if (connection.connected) {
            const json = JSON.stringify({ type: "STATE" });
            connection.sendUTF(json);
        }
    }
});
app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
clientInstance.connect(`ws://0.0.0.0:${PORT}/ws`);
