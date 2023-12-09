"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromServerSendMessageToInstrument = exports.startInstrumentConnection = exports.getInstrumentConnection = void 0;
const websocket_1 = require("websocket");
const startUp_1 = require("./startUp");
const wsClientFunctions_1 = require("./wsClientFunctions");
/*            Instrument Websocket functions            */
const clientInstance = new websocket_1.client();
const INSTRUMENT_WS_PORT = 80;
/**
 * connectionState
 * @description variable describing the current state of the instrument connection
 * @type {boolean}
 * @default false
 * getConnectionState: returns the connectionState variable
 * setInstrumentConnection: sets the connectionState variable
 */
let connectionState = false;
function getConnectionState() {
    return connectionState;
}
function setInstrumentConnection(state) {
    connectionState = state;
}
/**
 * sendMessageToInstrument
 * @description function that sends a message to the instrument
 */
let sendMessageToInstrument;
/**
 * getInstrumentConnection
 * @returns {boolean} connection state of the instrument
 * @description function that returns the connection state of the instrument
 * The function is called in the startUp.ts file
 */
function getInstrumentConnection() {
    const connection = getConnectionState();
    return connection;
}
exports.getInstrumentConnection = getInstrumentConnection;
/**
 * startInstrumentConnection
 * @description function that starts the instrument connection instance
 * The function is called in the startUp.ts file when waiting for the instrument to connect
 */
const startInstrumentConnection = () => {
    clientInstance.connect(`ws://0.0.0.0:${INSTRUMENT_WS_PORT}/ws`);
};
exports.startInstrumentConnection = startInstrumentConnection;
/**
 * WebSocket connectFailed
 * @description function that handles the connection failed event
 */
clientInstance.on("connectFailed", function () {
    console.log("Connection to instrument failed");
});
/**
 * WebSocket connect
 * @description function that handles the connection event
 * The function also handles what happens when the connection is closed, an error occurs or if a message is received
 */
clientInstance.on("connect", function (connection) {
    console.log("Instrument Connected");
    setInstrumentConnection(true);
    (0, wsClientFunctions_1.sendMessageToClient)(JSON.parse(JSON.stringify({ type: "INSTRUMENT_CONNECTION", content: getConnectionState() })));
    connection.on("error", function (error) {
        console.log("Instrument error occurred :" + error.toString());
    });
    connection.on("close", function () {
        console.log("Instrument  closed");
        setInstrumentConnection(false);
        (0, wsClientFunctions_1.sendMessageToClient)(JSON.parse(JSON.stringify({ type: "INSTRUMENT_CONNECTION", content: getConnectionState() })));
        (0, startUp_1.reconnectToInstrument)();
    });
    connection.on("message", function (message) {
        console.log("Received message from instrument", message);
        handleReceivedMessage(message);
    });
    /**
     * sendMessageToInstrument
     * @description function that sends a message to the instrument
     * @param {string} message - message to send to the instrument
     */
    sendMessageToInstrument = function (message) {
        try {
            connection.send(message);
        }
        catch (error) {
            console.log("sendMessageToInstrument: Error occurred while sending message to instrument");
        }
    };
});
/**
 * handleReceivedMessage
 * @param message - message received from the instrument
 * @description function that handles the received message from the instrument via websocket
 */
function handleReceivedMessage(message) {
    if (message.type === 'utf8') {
        const json = JSON.parse(message.utf8Data);
        console.log("Received message from instrument: ", json);
        switch (json.type) {
            case "STATE": {
                const instrumentState = json.content;
                (0, startUp_1.setInstrumentState)(instrumentState);
                (0, wsClientFunctions_1.sendMessageToClient)(json); //inform client of changes
                console.log("STATE: ", instrumentState);
                break;
            }
            case "INITIALIZE": {
                const initializeBool = json.content;
                (0, wsClientFunctions_1.sendMessageToClient)(json); //inform client of changes
                console.log("INITIALIZE: ", initializeBool);
                break;
            }
            case "RUN": {
                const runBool = json.content;
                (0, wsClientFunctions_1.sendMessageToClient)(json); //inform client of changes
                console.log("RUN: ", runBool);
                break;
            }
            default: {
                console.log("handleReceivedMessage: WS instrument Default");
                break;
            }
        }
    }
}
// Export the sendMessage function
/**
 * fromServerSendMessageToInstrument
 * @param messageToSend - message to send to the instrument
 * @description function that sends a message to the instrument when called from the client ws
 * e.g. when the user clicks a button on the client, the client ws send a message to the server and this function forwards it to the instrument
 */
const fromServerSendMessageToInstrument = function (messageToSend) {
    if (messageToSend !== "STATE" && messageToSend !== "INITIALIZE" && messageToSend !== "RUN") {
        return;
    }
    else {
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
                console.log("fromServerSendMessageToInstrument: Default");
                break;
        }
    }
};
exports.fromServerSendMessageToInstrument = fromServerSendMessageToInstrument;
