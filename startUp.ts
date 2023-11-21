import { getIp } from "./helperFunctions/helperFunctions";
import { getServer } from "./wsFunctions/RESTRobotFunctions";
import { getInstrumentConnection, startInstrumentConnection  } from './wsFunctions/wsInstrumentFunctions';
import { getWsClient, startClientServer } from "./wsFunctions/wsClientFunctions";
import { RobotStates } from "./Types/runState";
import { InstrumentStates } from "./Types/instrumentStates";

/**
 * robotState
 * @description variable describing the current state of the robot
 * @type {RobotStates}
 * @default RobotStates.UNKNOWN
 * setRobotState: sets the robotState variable
 * getRobotState: returns the robotState variable
 */
let robotState: RobotStates = RobotStates.UNKNOWN;
export const setRobotState = (newStatus: RobotStates) => {
  robotState = newStatus;
}
export const getRobotState = () => {
  return robotState;
}

/**
 * instrumentState
 * @description variable describing the current state of the instrument
 * @type {InstrumentStates}
 * @default InstrumentStates.NO_STATE
 * setInstrumentState: sets the instrumentState variable
 * getInstrumentState: returns the instrumentState variable
 */
let instrumentState: InstrumentStates = InstrumentStates.NO_STATE;
export const setInstrumentState = (newStatus: InstrumentStates) => {
  instrumentState = newStatus;
}
export const getInstrumentState = () => {
  return instrumentState;
}

/**
 * waitForRobotConnection
 * @description function that waits for the robot to connect
 * The function is called in the startUp.ts file
 * The function is called recursively every 10 seconds until the robot's IP is found
 */
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

/**
 * waitForServerConnection
 * @description function that waits for the python server to connect
 * The function is called recursively every 10 seconds until the python server is connected
 */
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

/**
 * waitForInstrumentConnection
 * @description function that waits for the instrument to connect
 * The function is called recursively every 10 seconds until the instrument is connected
 */
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

/**
 * waitForClientConnection
 * @description function that waits for the client to connect
 * The function is called recursively every 3 seconds until the client is connected
 */
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

/**
 * reconnectToRobot
 * @description function that reconnects to the instrument, if the instrument is disconnected
 * The function is called recursively every 3 seconds until the instrument is reconnected
 */
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

/**
 * reconnectToClient
 * @description function that reconnects to the client, if the client is disconnected
 * The function is called recursively every 3 seconds until the client is reconnected
 */
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