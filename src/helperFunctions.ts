import { informPythonServerIpUpdate } from "./RESTRobotFunctions";
import express, { Express, Request, Response } from "express"; // is a web app framework used for building APIs.
import DiscoveryClient, { SERVICE_EVENT, SERVICE_REMOVED_EVENT } from '@opentrons/discovery-client';
import Service from "../Types/Service";

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
 * robotIP
 * @description variable used to store the robot's IP address
 * @type {string}
 * @default ""
 * getIp: returns the robotIP variable
 * setIp: sets the robotIP variable
 */
let robotIP: string = "";
export function getIp(): string {
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
      console.log("The current Ip Address is: ", getIp());
      return res.send("Hello from Node server!");
    });
    
    //there should be made a call to the python server whenever the robot is connected
    app.get("/connect", (req: Request, res: Response) => {
      const tempIp = getIp();
      console.log("The current IP Address is: ", tempIp);
      return res.status(200).json({data: tempIp});
    });
    
    app.listen(PORT, () => {
      console.log(`⚡️[server]: REST server is running at http://localhost:${PORT}`);
    });
    
}