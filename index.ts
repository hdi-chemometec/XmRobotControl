import express, { Express, Request, Response } from "express"; // is a web app framework used for building APIs.
import WebSocket from 'ws';

import { Message, client, connection } from 'websocket';
import DiscoveryClient, { SERVICE_EVENT, SERVICE_REMOVED_EVENT } from '@opentrons/discovery-client';
import Service from "./Types/Service";
import { States } from "./Types/instrument_states";

import { getIpAddress, wsGetServer, wsGetRobot, wsGetProtocols, wsPostRun, wsRun, wsRunStatus } from "./ws_robot_functions/ws_robot_functions";

const WSPORT = 8084;
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

const clientInstance = new client();

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


const wsServer = new WebSocket.Server({ port: WSPORT });
wsServer.on('connection', (ws: WebSocket) => {
    console.log(`New client connected on PORT ${WSPORT}`);
  
    ws.on('message', (message: string) => {
      console.log(`Received message: ${message}`);
      handleWsMessages(message, ws);
    });
  
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  function handleWsMessages(message: string, ws: WebSocket) {
    const json = JSON.parse(message);
    console.log(json.type);
    switch (json.type) {
      case "PING":{
        console.log("PING");
        const response =JSON.stringify({ type: "PING", payload: "PONG" });
        ws.send(response);
        break;}
      case "SERVER":{
        console.log("SERVER");
        wsGetServer(ws);
        break;
      }
      case "ROBOT":{
        console.log("ROBOT");
        wsGetRobot(ws);
        break;
      }
      case "PROTOCOLS":{
        console.log("PROTOCOLS");
        wsGetProtocols(ws);
        break;
      }
      case "RUN": {
        console.log("RUN");
        const protocol_id = json.protocolId;
        wsPostRun(ws, protocol_id);
        break;
      }
      case "RUN_STATUS": {
        console.log("RUN_STATUS");
        wsRunStatus(ws);
        break;
      }
      case "COMMAND": {
        console.log("COMMAND");
        const protocol_id = json.protocol_id;
        const command = json.command;
        wsRun(ws, protocol_id, command);
        break;
      }
      default:
        console.log("Default");
        break;
  }
}

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

//      Instrument Websocket functions     //
const Instrument_WS_PORT = 80;
let instrument_state: States = States.NO_STATE;
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

    connection.on("message", function (message: Message) {
        handleReceivedMessage(message);  
    });
});

function transmitMessageState(connection: connection) {
    if (connection.connected) {
      const json = JSON.stringify({ type: "STATE" });
      connection.send(json);
    }
}

function handleReceivedMessage(message: Message) {
  console.log("State message received: ", message);
  if(message.type === 'utf8') {
    const json = JSON.parse(message.utf8Data);
    switch (json.type) {
      case "State": {
        instrument_state = json.content;
        console.log("State: ", instrument_state);
        break;
      }
      default:{
        console.log("Default");
        break;
      }
    }
  }
}

clientInstance.connect(`ws://0.0.0.0:${Instrument_WS_PORT}/ws`);