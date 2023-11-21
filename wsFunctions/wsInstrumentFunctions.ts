import { Message, client } from 'websocket';
import { InstrumentStates } from "../Types/instrumentStates";
import { setInstrumentState, reconnectToInstrument } from '../startUp';
import { sendMessageToClient } from './wsClientFunctions';

/*            Instrument Websocket functions            */

const clientInstance = new client();
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
function getConnectionState(): boolean {
  return connectionState;
}
function setInstrumentConnection(state: boolean) {
  connectionState = state;
}

/**
 * sendMessageToInstrument
 * @description function that sends a message to the instrument
 */
let sendMessageToInstrument: (message: string) => void;

/**
 * getInstrumentConnection
 * @returns {boolean} connection state of the instrument
 * @description function that returns the connection state of the instrument
 * The function is called in the startUp.ts file
 */
export function getInstrumentConnection(): boolean {
  const connection = getConnectionState();
  return connection;
}

/**
 * startInstrumentConnection
 * @description function that starts the instrument connection instance
 * The function is called in the startUp.ts file when waiting for the instrument to connect
 */
export const startInstrumentConnection = () => {
  clientInstance.connect(`ws://0.0.0.0:${INSTRUMENT_WS_PORT}/ws`);
}

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

    connection.on("error", function (error) {
        console.log("Instrument error occurred :" + error.toString());
    });

    connection.on("close", function () {
        console.log("Instrument  closed");
        setInstrumentConnection(false);
        reconnectToInstrument();
    });

    connection.on("message", function (message: Message) {
      console.log("Received message from instrument", message);
        handleReceivedMessage(message);  
    });

    /**
     * sendMessageToInstrument
     * @description function that sends a message to the instrument
     * @param {string} message - message to send to the instrument
     */
    sendMessageToInstrument = function (message: string): void {
      try {
        connection.send(message);
      } catch (error) {
        console.log("Instrument is not connected");
      }
    }
});

/**
 * handleReceivedMessage
 * @param message - message received from the instrument
 * @description function that handles the received message from the instrument via websocket
 */
function handleReceivedMessage(message: Message) {
  if(message.type === 'utf8') {
    const json = JSON.parse(message.utf8Data);
    console.log("Received message from instrument: ",json);
    sendMessageToClient(json); //inform client of changes
    switch (json.type) {
      case "STATE": {
        const instrumentState: InstrumentStates = json.content;
        setInstrumentState(instrumentState);
        console.log("STATE: ", instrumentState);
        break;
      }
      case "INITIALIZE": {
        const initializeBool: string = json.content;
        console.log("INITIALIZE: ", initializeBool);
        break;
      }
      case "RUN": {
        const runBool: string = json.content;
        console.log("RUN: ", runBool);
        break;
      }
      case "DATA_READY": {
        const finishedBool: string = json.content;
        console.log("DATA_READY", finishedBool);
        break;
      }
      default:{
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
export const fromServerSendMessageToInstrument = function (messageToSend: string) {
  if(messageToSend !== "STATE" && messageToSend !== "INITIALIZE" && messageToSend !== "RUN") {
    return;
  } else {
    switch (messageToSend) {
      case "STATE": {
        const stateRequest = JSON.stringify({type: "STATE"});
        sendMessageToInstrument(stateRequest);
        break;
      }
      case "INITIALIZE":  {
        const initializeRequest = JSON.stringify({type: "INITIALIZE"});
        sendMessageToInstrument(initializeRequest);
        break;
      }
      case "RUN":  {
        const runRequest = JSON.stringify({type: "RUN", assay: "Count & Viability", measurement: "Protocols"});
        sendMessageToInstrument(runRequest);
        break;
      }
      default:
        console.log("fromServerSendMessageToInstrument: Default");
        break;
      }  
    }
};