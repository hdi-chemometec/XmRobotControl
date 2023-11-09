import express, { Express, Request, Response } from "express"; // is a web app framework used for building APIs.

import DiscoveryClient, { SERVICE_EVENT, SERVICE_REMOVED_EVENT } from '@opentrons/discovery-client';
import Service from "./Types/Service";

import { getIpAddress } from "./ws_robot/ws_robot_functions";


const robot = new DiscoveryClient();
let robotIP = "";

function get_ip(): string {
  return robotIP;
}

function set_ip(ip: string) {
  robotIP = ip;
}

// functions used for getting the robot IP address:
robot.start();

robot.on(SERVICE_EVENT, (service: Array<Service>) => {
    service.forEach((service) => {
      if(service.serverOk){
        console.log("Ip address found: ", service.ip);
        if(service.ip != null) {
          set_ip(service.ip);
          console.log("Updated IP address: ", get_ip());
          getIpAddress();
        }
      }
      else {
        console.log("No robot is connected")
        set_ip("");
        getIpAddress();
      }
    });
});

robot.on(SERVICE_REMOVED_EVENT, (service: Array<Service>) => {
    service.forEach((service) => {
        console.log("Ip address removed: ", service.ip);
        set_ip("");
        getIpAddress();
    });
});

const PORT = process.env.PORT ?? 4000;
const app: Express = express();


app.get("/", (req: Request, res: Response) => {
  console.log("The current Ip Address is: ", get_ip());
  return res.send("Hello from Node server!");
});

//there should be made a call to the python server whenever the robot is connected
app.get("/connect", (req: Request, res: Response) => {
  console.log("Called get_connection");
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  const tempId = get_ip();
  if (ipv4Pattern.test(tempId)) {
    // Check if it's a valid IPv4 address
    const parts = tempId.split('.');
    for (const part of parts) {
      const num = parseInt(part, 10);
      if (num < 0 || num > 255) {
        console.log("No robot is connected")
        return res.status(404).send('No robot IP address found. Make sure the robot is turned on!');
      }
    }
    console.log("Robot is connected", tempId)
    return res.status(200).json({data: tempId});
  } else if (ipv6Pattern.test(tempId)) {
    // Check if it's a valid IPv6 address
    console.log("Robot is connected", tempId)
    return res.status(200).json({data: tempId});
  }
  console.log("No robot is connected")
  return res.status(404).send('No robot IP address found. Make sure the robot is turned on!');
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});