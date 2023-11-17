import { Message, client } from 'websocket';
import { InstrumentStates } from "../Types/instrumentStates";
import { setInstrumentState } from '../index';
import { sendMessageToClient } from './ws_client_functions';

/*            Instrument Websocket functions            */

const clientInstance = new client();
const Instrument_WS_PORT = 80;
let connection_state = false;

function getConnectionState(): boolean {
  return connection_state;
}

function setInstrumentConnection(state: boolean) {
  connection_state = state;
}

let finishRun: boolean;
export function getFinishRun(): boolean {
  return finishRun;
}

function setFinishRun(state: boolean) {
  finishRun = state;
}


let sendMessageToInstrument: (message: string) => void;

export function getInstrumentConnection(): boolean {
  const connection = getConnectionState();
  if(!connection) {
    return false;
  } else {
    return true;
  }
}

export const startInstrumentConnection = () => {
  clientInstance.connect(`ws://0.0.0.0:${Instrument_WS_PORT}/ws`);
}

clientInstance.on("connectFailed", function () {
  console.log("Connection to instrument failed");
});

clientInstance.on("connect", function (connection) {
    console.log("Instrument Connected");
    setInstrumentConnection(true);

    connection.on("error", function (error) {
        console.log("Instrument error occurred :" +error.toString());
    });

    connection.on("close", function () {
        console.log("Instrument  closed");
    });

    connection.on("message", function (message: Message) {
      console.log("Received message from instrument", message);
        handleReceivedMessage(message);  
    });

    sendMessageToInstrument = function (message: string): void {
      try {
        connection.send(message);
      } catch (error) {
        console.log("Instrument is not connected");
      }
    }
});

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
        setFinishRun(false);
        const runBool: string = json.content;
        console.log("RUN: ", runBool);
        break;
      }
      case "DATA_READY": {
        const finishedBool: string = json.content;
        console.log("DATA_READY", finishedBool);
        if(finishedBool == "true") {
          setFinishRun(true);
        } else {
          setFinishRun(false);
        }
        break;
      }
      default:{
        console.log("Default");
        break;
      }
    }
  }
}

// Export the sendMessage function
export const fromServerSendMessageToInstrument = function (messageToSend: string) {
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
    console.log("Default");
    break;
  }
};