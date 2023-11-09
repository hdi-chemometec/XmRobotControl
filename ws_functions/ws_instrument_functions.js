"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = require("websocket");
const instrument_states_1 = require("../Types/instrument_states");
/*            Instrument Websocket functions            */
const clientInstance = new websocket_1.client();
const Instrument_WS_PORT = 80;
let instrument_state = instrument_states_1.States.NO_STATE;
clientInstance.on("connectFailed", function (error) {
    console.log("Connect Error: " + error.toString());
});
clientInstance.on("connect", function (connection) {
    console.log("WebSocket Client Connected");
    transmitMessageState(connection);
    connection.on("error", function (error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on("close", function () {
        console.log("Connection closed");
    });
    connection.on("message", function (message) {
        handleReceivedMessage(message);
    });
});
function transmitMessageState(connection) {
    if (connection.connected) {
        const json = JSON.stringify({ type: "STATE" });
        connection.send(json);
    }
}
function handleReceivedMessage(message) {
    console.log("State message received: ", message);
    if (message.type === 'utf8') {
        const json = JSON.parse(message.utf8Data);
        switch (json.type) {
            case "State": {
                instrument_state = json.content;
                console.log("State: ", instrument_state);
                break;
            }
            default: {
                console.log("Default");
                break;
            }
        }
    }
}
clientInstance.connect(`ws://0.0.0.0:${Instrument_WS_PORT}/ws`);
