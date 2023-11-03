import express, { Express, Request, Response } from "express"; // is a web app framework used for building APIs.
import axios from "axios"; // library used for making HTTP requests to servers. E.g. the flask server
import WebSocket from 'ws';

import { client } from 'websocket';
import DiscoveryClient, { SERVICE_EVENT, SERVICE_REMOVED_EVENT } from '@opentrons/discovery-client';
import Service from "./Types/Service";

const robot = new DiscoveryClient();
let robotIP = "";
const WSPORT = 8084;

const headers = {
  'Content-Type': 'application/json'
}

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
          updateRobotIP("true");
        }
      }
      else {
        console.log("No robot is connected")
        set_ip("");
        updateRobotIP("false");
      }
    });
});

robot.on(SERVICE_REMOVED_EVENT, (service: Array<Service>) => {
    service.forEach((service) => {
        console.log("Ip address removed: ", service.ip);
        set_ip("");
        updateRobotIP("false");
    });
});

const PORT = process.env.PORT ?? 4000;
const app: Express = express();

const clientInstance = new client();
const pythonServer = "http://127.0.0.1:5000";

app.get("/", (req: Request, res: Response) => {
  console.log("The current Ip Address is: ", get_ip());
  return res.send("Hello from Node server!");
});

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


//      Websocket functions     //
clientInstance.on("connectFailed", function (error) {
  console.log("Connect Error: " + error.toString());
});

clientInstance.on("connect", function (connection) {
  console.log("WebSocket Client Connected");
  sendState();

  connection.on("error", function (error) {
    console.log("Connection Error: " + error.toString());
  });

  connection.on("close", function () {
    console.log("Connection closed");
  });

  connection.on("message", function (message) {
    if (message.type === "utf8") {
        console.log("Received: '" + message.utf8Data + "'");
        }
    });
  
  function sendState() {
    if (connection.connected) {
      const json = JSON.stringify({ type: "STATE" });
      connection.sendUTF(json);
    }
  }
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
        const protocol_id = json.protocol_id;
        wsPostRun(ws, protocol_id);
        break;
      }
      case "RUN_STATUS": {
        console.log("RUN_STATUS");
        wsRunStatus(ws);
        break;
      }
      default:
        console.log("Default");
        break;
  }
}

async function wsGetServer(ws: WebSocket) {
  try {
    const response = await axios.get(pythonServer + "/");
    console.log(response.status);
    console.log(response.data);
    if(response.status == 200) {
      const wsResponse = {type: "Server", payload: response.data}
      ws.send(JSON.stringify(wsResponse));
    } else {
      const wsResponse = {type: "Server", payload: response.data}
      console.error(`Non-200 response from Flask ${response.status}`);
      ws.send(JSON.stringify(wsResponse));
    }
  } catch (error) {
    console.error("Axios error occurred");
  }
}

async function wsGetRobot(ws: WebSocket) {
  try {
    const response = await axios.get(pythonServer + "/connect");
    console.log(response.status);
    console.log(response.data);
    if(response.status == 200) {
      const wsResponse = {type: "Robot", payload: response.data}
      ws.send(JSON.stringify(wsResponse));
    } else {
      console.error(`Non-200 response from Flask ${response.status}`);
      const wsResponse = {type: "Robot", payload: response.data}
      ws.send(JSON.stringify(wsResponse));
    }
  } catch (error) {
    console.error("Axios error occurred");
  }
}

function updateRobotIP(state: string) {
  const wsResponse = {type: "Robot", payload: `${state}`}
  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(wsResponse));
    }
  });
}

async function wsGetProtocols(ws: WebSocket) {
  try {
    const response = await axios.get(pythonServer + "/protocols");
    console.log(response.status);
    console.log(response.data);
    if(response.status == 200) {
      const wsResponse = {type: "Protocols", payload: response.data}
      ws.send(JSON.stringify(wsResponse));
    } else {
      console.error(`Non-200 response from Flask ${response.status}`);
      const wsResponse = {type: "Protocols", payload: response.data}
      ws.send(JSON.stringify(wsResponse));
    }
  } catch (error) {
    console.error("Axios error occurred");    
  }
}

async function wsPostRun(ws: WebSocket, protocol_id: string) {
  try {
    const body = {"protocol_id": protocol_id}
    console.log(body);
    const response = await axios.post(pythonServer + "/runs", body, {headers: headers});
    console.log(response.status);
    console.log(response.data);
    if(response.status == 201) {
      const wsResponse = {type: "Run", payload: response.data}
      ws.send(JSON.stringify(wsResponse));
    } else {
      console.error(`Non-201 response from Flask ${response.status}`);
      const wsResponse = {type: "Run", payload: response.data}
      ws.send(JSON.stringify(wsResponse));
    }
  } catch (error) {
    console.error("Axios error occurred");    
  }
}

async function wsRunStatus(ws: WebSocket) {
  try {
    const response = await axios.get(pythonServer + "/runStatus");
    console.log(response.status);
    console.log(response.data);
    if(response.status == 200) {
      const wsResponse = {type: "RunStatus", payload: response.data}
      ws.send(JSON.stringify(wsResponse));
    }
  } catch (error) {
    console.error("Axios error occurred")
  }
}


app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

clientInstance.connect(`ws://0.0.0.0:${PORT}/ws`);