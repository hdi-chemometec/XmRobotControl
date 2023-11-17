import { informPythonServerIpUpdate } from "../ws_functions/ws_robot_functions";
import express, { Express, Request, Response } from "express"; // is a web app framework used for building APIs.

import DiscoveryClient, { SERVICE_EVENT, SERVICE_REMOVED_EVENT } from '@opentrons/discovery-client';
import Service from "../Types/Service";

const robot = new DiscoveryClient();
let robotIP: string = "";

// functions used for getting the robot IP address:
robot.start();

robot.on(SERVICE_EVENT, (service: Array<Service>) => {
    service.forEach((service) => {
      if(service.serverOk){
        console.log("Ip address found: ", service.ip);
        if(service.ip != null) {
          set_ip(service.ip);
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

function get_ip(): string {
  return robotIP;
}

function set_ip(ip: string) {
  robotIP = ip;
}

export function getIp(): string {
    if(robotIP != "") {
      return robotIP;
    } else {
      return "No robot IP address found. Make sure the robot is turned on!";
    }
}

function startNodeServer(){
    const PORT = process.env.PORT ?? 4000;
    const app: Express = express();
    
    
    app.get("/", (req: Request, res: Response) => {
      console.log("The current Ip Address is: ", get_ip());
      return res.send("Hello from Node server!");
    });
    
    //there should be made a call to the python server whenever the robot is connected
    app.get("/connect", (req: Request, res: Response) => {
      const tempIp = get_ip();
      console.log("The current Ip Address is: ", tempIp);
      return res.status(200).json({data: tempIp});
    });
    
    app.listen(PORT, () => {
      console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
    });
    
}

export { startNodeServer };