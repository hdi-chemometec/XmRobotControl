import express, { Express, Request, Response } from "express"; // is a web app framework used for building APIs.
import axios from "axios"; // library used for making HTTP requests to servers. E.g. the flask server

import { client } from 'websocket';
import DiscoveryClient, { SERVICE_EVENT, SERVICE_REMOVED_EVENT } from '@opentrons/discovery-client';
import Service from "./Types/Service";

const robot = new DiscoveryClient();
let robotIP = "";

// functions used for getting the robot IP address:
robot.start();

robot.on(SERVICE_EVENT, (service: Array<Service>) => {
    service.forEach((service) => {
        console.log("Ip address found: ", service.ip);
        if(service.ip != null) {
          robotIP = service.ip;
        }
    });
});

robot.on(SERVICE_REMOVED_EVENT, (service: Array<Service>) => {
    service.forEach((service) => {
        console.log("Ip address removed: ", service.ip);
        robotIP = "";
    });
});

const PORT = process.env.PORT ?? 80;
const app: Express = express();

const clientInstance = new client();
const pythonServer = "http://127.0.0.1:5000";

const headers = {
  'Content-Type': 'application/json'
}

app.get("/", (req: Request, res: Response) => {
  console.log("The current Ip Address is: ", robotIP);
  return res.send("Hello from Node server!");
});

app.get("/connect", get_connection);
app.get("/server", get_server);
app.get("/protocols", get_protocols);
app.get("/runs", get_runs);
app.post("/runs", post_run);
app.post("/execute", post_execute);
app.get("/runStatus", get_runStatus);
app.get('/lights', get_lights);
app.post('/lights', post_lights);

function get_connection(req: Request, res: Response) {
  console.log("Called get_connection");
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  if (ipv4Pattern.test(robotIP)) {
    // Check if it's a valid IPv4 address
    const parts = robotIP.split('.');
    for (const part of parts) {
      const num = parseInt(part, 10);
      if (num < 0 || num > 255) {
        return res.status(404).send('No robot IP address found. Make sure the robot is turned on!');
      }
    }
    return res.status(200).json({data: robotIP});
  } else if (ipv6Pattern.test(robotIP)) {
    // Check if it's a valid IPv6 address
    return res.status(200).json({data: robotIP});
  }
  return res.status(404).send('No robot IP address found. Make sure the robot is turned on!');
}

function get_server(req: Request, res: Response) {
  console.log("Called get_server");
  axios
    .get(pythonServer + "/")
    .then((response) => {
      const responseJson = response.data;
      return res.json({ data: responseJson });
    })
    .catch((error) => {
      console.error("Error occurred", error);
      return res.status(500).json({ error: "Internal Server Error" });
    });
}

function get_data(req: Request) {
  console.log("Called get_data");
  return new Promise((resolve, reject) => {
    try {
      let data = '';
      req.on('data', (chunk) => {
        data += chunk.toString();
      })
      req.on('end', () => {
        req.body = JSON.parse(data);
        resolve(data);
      })
    } catch (error) {
      reject(error);
    }
  })
}

function get_protocols(req: Request, res: Response) {
  console.log("Called get_protocols");
  axios
    .get(pythonServer + "/protocols")
    .then((response) => {
      const responseJson = response.data;
      return res.json({ data: responseJson });
    })
    .catch((error) => {
      console.error("Error occurred", error);
      return res.status(500).json({ error: "Internal Server Error" });
    });
}

function get_runs(req: Request, res: Response) {
  console.log("Called get_runs");
  axios
  .get(pythonServer + "/runs")
  .then((response) => {
    const responseJson = response.data;
    return res.json({ data: responseJson });
  })
  .catch((error) => {
    console.error("Error occurred", error);
    return res.status(500).json({ error: "Internal Server Error" });
  });
}

async function post_run(req: Request, res: Response) {
  console.log("Called post_run");
  const body = await get_data(req);
  console.log(body);
  await axios({
    method: 'post',
    url: pythonServer + "/runs",
    data: body,
    headers: headers
  }).then( response => {
      const responseJson = response.data;
      return res.json({ data: responseJson });
    })
    .catch((error) => {
      console.error("Error occurred", error);
      return res.status(500).json({ error: "Internal Server Error" });
    });
  }

function post_execute(req: Request, res: Response) {
  console.log("Called post_execute");
  axios
    .post(pythonServer + "/execute")
    .then((response) => {
      const responseJson = response.data;
      return res.json({ data: responseJson });
    })
    .catch((error) => {
      console.error("Error occurred", error);
      return res.status(500).json({ error: "Internal Server Error" });
    });
}

function get_runStatus(req: Request, res: Response) {
  console.log("Called get_runStatus");
  axios
    .get(pythonServer + "/runStatus")
    .then((response) => {
      const responseJson = response.data;
      return res.json({ data: responseJson });
    })
    .catch((error) => {
      console.error("Error occurred", error);
      return res.status(500).json({ error: "Internal Server Error" });
    });
}

function get_lights(req: Request, res: Response) {
  console.log("Called get_lights");
  axios.get(pythonServer + "/lights")
  .then((response) => {
    const responseJson = response.data;
    return res.json({ data: responseJson });
  })
  .catch((error) => {
    console.error("Error occurred", error);
    return res.status(500).json({ error: "Internal Server Error" });
  });
}

async function post_lights(req: Request, res: Response) {
  console.log("Called post_lights");
  console.log("post lights");
  const body = await get_data(req);
  console.log(body);
  axios({
    method: 'post',
    url: pythonServer + "/lights",
    data: body,
    headers: headers
  }).then( response => {
      const responseJson = response.data;
      return res.json({ data: responseJson });
    })
    .catch((error) => {
      console.error("Error occurred", error);
      return res.status(500).json({ error: "Internal Server Error" });
    })
  }

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

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

clientInstance.connect(`ws://0.0.0.0:${PORT}/ws`);