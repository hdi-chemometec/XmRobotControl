import { getIp } from "./helper_functions/helperFunctions";
import { getServer } from "./ws_functions/REST_robot_functions";
import { getInstrumentConnection, startInstrumentConnection  } from './ws_functions/ws_instrument_functions';
import { getWsClient, startClientServer } from "./ws_functions/ws_client_functions";
import { RobotStates } from "./Types/runState";
import { InstrumentStates } from "./Types/instrumentStates";

let robotState: RobotStates = RobotStates.UNKNOWN;
export const setRobotState = (newStatus: RobotStates) => {
  robotState = newStatus;
}
export const getRobotState = () => {
  return robotState;
}

let instrumentState: InstrumentStates = InstrumentStates.NO_STATE;
export const setInstrumentState = (newStatus: InstrumentStates) => {
  instrumentState = newStatus;
}
export const getInstrumentState = () => {
  return instrumentState;
}

export function waitForRobotConnection() {
  setTimeout(function() {
    const ipConnection = getIp();
    console.log("Robot connection state: ", ipConnection);
    if(ipConnection == "") {
      console.log("Robot not connected");
      waitForRobotConnection();
    } else {
      console.log("Robot is connected");
      waitForServerConnection();
    }
  }, 10000);
}

async function waitForServerConnection() {
  const serverConnection = await getServer();
  setTimeout(function() {
    console.log("Python server connection state: ", serverConnection);
    if(!serverConnection) {
      console.log("Python server not connected");
      waitForServerConnection();
    } else {
      console.log("Python server is connected");
      startInstrumentConnection();
      waitForInstrumentConnection();
    }
  }, 10000);
}

function waitForInstrumentConnection() {
  setTimeout(function() {
    const instrumentConnection = getInstrumentConnection();
    console.log("Instrument connection state: ", instrumentConnection);
    if(!instrumentConnection) {
      console.log("Instrument is not connected");
      startInstrumentConnection();
      waitForInstrumentConnection();
    } else {
      console.log("Instrument is connected");
      startClientServer();
      waitForClientConnection();
    }
  }, 10000);
}

function waitForClientConnection() {
  setTimeout(function() {
    const clientConnection = getWsClient()
    console.log("Client connection state: ", clientConnection);
    if(!clientConnection) {
      console.log("Client is not connected");
      waitForClientConnection();
    } else {
      console.log("Client is connected");
    }
  }, 3000);
}


export function reconnectToInstrument() {
  setTimeout(function() {
    const instrumentConnection = getInstrumentConnection();
    console.log("Instrument connection state: ", instrumentConnection);
    if(!instrumentConnection) {
      console.log("Instrument is not connected");
      startInstrumentConnection(); //server is client so the instance must be restarted
      reconnectToInstrument();
    } else {
      console.log("Instrument is reconnected");
    }
  }, 3000);
}

export function reconnectToClient() {
  setTimeout(function() {
    const clientConnection = getWsClient()
    console.log("Client connection state: ", clientConnection);
    if(!clientConnection) {
      console.log("Client is not connected");
      reconnectToClient();
    } else {
      console.log("Client is reconnected");
    }
  }, 3000);
}