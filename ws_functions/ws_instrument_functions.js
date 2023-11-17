"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromServerSendMessageToInstrument = exports.startInstrumentConnection = exports.getInstrumentConnection = void 0;
const websocket_1 = require("websocket");
const startUp_1 = require("../startUp");
const ws_client_functions_1 = require("./ws_client_functions");
const startUp_2 = require("../startUp");
/*            Instrument Websocket functions            */
const clientInstance = new websocket_1.client();
const Instrument_WS_PORT = 80;
let connection_state = false;
function getConnectionState() {
    return connection_state;
}
function setInstrumentConnection(state) {
    connection_state = state;
}
let sendMessageToInstrument;
function getInstrumentConnection() {
    const connection = getConnectionState();
    return connection;
}
exports.getInstrumentConnection = getInstrumentConnection;
const startInstrumentConnection = () => {
    clientInstance.connect(`ws://0.0.0.0:${Instrument_WS_PORT}/ws`);
};
exports.startInstrumentConnection = startInstrumentConnection;
clientInstance.on("connectFailed", function () {
    console.log("Connection to instrument failed");
    (0, startUp_2.waitForInstrumentConnection)();
});
clientInstance.on("connect", function (connection) {
    console.log("Instrument Connected");
    setInstrumentConnection(true);
    connection.on("error", function (error) {
        console.log("Instrument error occurred :" + error.toString());
    });
    connection.on("close", function () {
        console.log("Instrument  closed");
        (0, startUp_2.waitForInstrumentConnection)();
    });
    connection.on("message", function (message) {
        console.log("Received message from instrument", message);
        handleReceivedMessage(message);
    });
    sendMessageToInstrument = function (message) {
        try {
            connection.send(message);
        }
        catch (error) {
            console.log("Instrument is not connected");
        }
    };
});
function handleReceivedMessage(message) {
    if (message.type === 'utf8') {
        const json = JSON.parse(message.utf8Data);
        console.log("Received message from instrument: ", json);
        (0, ws_client_functions_1.sendMessageToClient)(json); //inform client of changes
        switch (json.type) {
            case "STATE": {
                const instrumentState = json.content;
                (0, startUp_1.setInstrumentState)(instrumentState);
                console.log("STATE: ", instrumentState);
                break;
            }
            case "INITIALIZE": {
                const initializeBool = json.content;
                console.log("INITIALIZE: ", initializeBool);
                break;
            }
            case "RUN": {
                const runBool = json.content;
                console.log("RUN: ", runBool);
                break;
            }
            case "DATA_READY": {
                const finishedBool = json.content;
                console.log("DATA_READY", finishedBool);
                break;
            }
            default: {
                console.log("Default");
                break;
            }
        }
    }
}
// Export the sendMessage function
const fromServerSendMessageToInstrument = function (messageToSend) {
    switch (messageToSend) {
        case "STATE": {
            const stateRequest = JSON.stringify({ type: "STATE" });
            sendMessageToInstrument(stateRequest);
            break;
        }
        case "INITIALIZE": {
            const initializeRequest = JSON.stringify({ type: "INITIALIZE" });
            sendMessageToInstrument(initializeRequest);
            break;
        }
        case "RUN": {
            const runRequest = JSON.stringify({ type: "RUN", assay: "Count & Viability", measurement: "Protocols" });
            sendMessageToInstrument(runRequest);
            break;
        }
        default:
            console.log("Default");
            break;
    }
};
exports.fromServerSendMessageToInstrument = fromServerSendMessageToInstrument;
