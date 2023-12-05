import express, { Express, Request, Response } from "express"; // is a web app framework used for building APIs.
import DiscoveryClient, { SERVICE_EVENT, SERVICE_REMOVED_EVENT } from '@opentrons/discovery-client';
import Service from "../Types/Service";
import { getServer } from "./RESTRobotFunctions";
import { getInstrumentConnection, startInstrumentConnection  } from './wsInstrumentFunctions';
import { getWsClient, startClientServer } from "./wsClientFunctions";
import { RobotStates } from "../Types/runState";
import { InstrumentStates } from "../Types/instrumentStates";
import { informPythonServerIpUpdate } from "./RESTRobotFunctions";

/**
 * robot
 * @description a new instance of the DiscoveryClient class
 * @type {DiscoveryClient}
 * It is used to handle events related to the robot connection to fetch the IP address of the robot
 */
const robot = new DiscoveryClient();

// functions used for getting the robot IP address:
robot.start();

robot.on(SERVICE_EVENT, (service: Array<Service>) => {
    service.forEach((service) => {
      if(service.serverOk){
        console.log("Ip address found: ", service.ip);
        if(service.ip != null) {
          setIp(service.ip);
          informPythonServerIpUpdate();
        }
      }
      else {
        console.log("No robot is connected");
      }
    });
});

robot.on(SERVICE_REMOVED_EVENT, (service: Array<Service>) => {
    service.forEach((service) => {
        console.log("Ip address removed: ", service.ip);
        informPythonServerIpUpdate();
    });
});

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
 * robotIP
 * @description variable used to store the robot's IP address
 * @type {string}
 * @default ""
 * getIp: returns the robotIP variable
 * setIp: sets the robotIP variable
 */
let robotIP: string = "";
function getIp(): string {
  if(robotIP != "") {
    return robotIP;
  } else {
    return "";
  }
}

function setIp(ip: string) {
  robotIP = ip;
}

/**
 * startNodeServer
 * @description function that starts the node server on port 4000
 */
export function startNodeServer(){
    const PORT = process.env.PORT ?? 4000;
    const app: Express = express();
    
    
    app.get("/", (req: Request, res: Response) => {
      return res.send("Hello from Node server!");
    });
    
    //there should be made a call to the python server whenever the robot is connected
    app.get("/connect", (req: Request, res: Response) => {
      const tempIp = getIp();
      return res.status(200).json({data: tempIp});
    });
    
    app.listen(PORT, () => {
      console.log(`⚡️[server]: REST server is running at http://localhost:${PORT}`);
    });
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
      waitForPythonServerConnection();
    }
  }, 10000);
}

/**
 * waitForServerConnection
 * @description function that waits for the python server to connect
 * The function is called recursively every 10 seconds until the python server is connected
 */
async function waitForPythonServerConnection() {
  const serverConnection = await getServer();
  setTimeout(function() {
    console.log("Python server connection state: ", serverConnection);
    if(!serverConnection) {
      console.log("Python server not connected");
      waitForPythonServerConnection();
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