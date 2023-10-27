import express, { Express, Request, Response } from "express"; // is a web app framework used for building APIs.
import axios from "axios"; // library used for making HTTP requests to servers. E.g. the flask server
import bodyParser from 'body-parser';

import { client } from 'websocket';
import DiscoveryClient, { SERVICE_EVENT, SERVICE_REMOVED_EVENT } from '@opentrons/discovery-client';
import Service from "./Types/Service";

const robot = new DiscoveryClient();
let robotIP = "";

// functions used for getting the robot IP address:
robot.start();

robot.on(SERVICE_EVENT, (service: Array<Service>) => {
    //console.log("Service found: ", service);
    service.forEach((service) => {
        console.log("Ip address found: ", service.ip);
        if(service.ip != null) {
          robotIP = service.ip;
        }
    });
});

robot.on(SERVICE_REMOVED_EVENT, (service: Array<Service>) => {
  //console.log("Service removed: ", service);
    service.forEach((service) => {
        console.log("Ip address removed: ", service.ip);
        robotIP = "";
    });
});

const PORT = process.env.PORT ?? 80;
const app: Express = express();

const clientInstance = new client();
const pythonServer = "http://127.0.0.1:5000";


app.use(bodyParser.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Node server!");
});

app.get("/connect", connect);
app.get("/server",server);
app.get("/protocols", protocols);
app.get("/runs", runs);
app.post("/execute", execute);
app.get("/runStatus", runStatus);
app.get('/lights', lights);
app.get("/lightsOff", lightsOff);
app.get("/lightsOn", lightsOn);

// test protocol 4cc224a7-f47c-40db-8eef-9f791c689fab
app.post("/add/:protocolId", (req: Request, res: Response) => {
  const protocolId = String(req.params.protocolId);
  console.log(protocolId);
  axios
    .post(pythonServer + "/runs/" + protocolId)
    .then((response) => {
      const responseJson = response.data;
      res.json({ data: responseJson });
    })
    .catch((error) => {
      console.error("Error occurred", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
}); 

function connect(req: Request, res: Response) {
  if(robotIP != "") {
    res.json({ data: robotIP });
    res.status(200).send();
  } else {
    res.status(404).send('No robot IP address found. Make sure the robot is turned on!');
  }
}

function server(req: Request, res: Response) {
  axios
    .get(pythonServer + "/")
    .then((response) => {
      const responseJson = response.data;
      res.json({ data: responseJson });
    })
    .catch((error) => {
      console.error("Error occurred", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
}

function protocols(req: Request, res: Response) {
  axios
    .get(pythonServer + "/protocols")
    .then((response) => {
      const responseJson = response.data;
      res.json({ data: responseJson });
    })
    .catch((error) => {
      console.error("Error occurred", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
}

function runs(req: Request, res: Response) {
  axios
  .get(pythonServer + "/runs")
  .then((response) => {
    const responseJson = response.data;
    res.json({ data: responseJson });
  })
  .catch((error) => {
    console.error("Error occurred", error);
      res.status(500).json({ error: "Internal Server Error" });
  });
}

function execute(req: Request, res: Response) {
  axios
    .post(pythonServer + "/execute/")
    .then((response) => {
      const responseJson = response.data;
      res.json({ data: responseJson });
    })
    .catch((error) => {
      console.error("Error occurred", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
}


function runStatus(req: Request, res: Response) {
  axios
    .get(pythonServer + "/runStatus/")
    .then((response) => {
      const responseJson = response.data;
      res.json({ data: responseJson });
    })
    .catch((error) => {
      console.error("Error occurred", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
}

function lights(req: Request, res: Response) {
  axios.get(pythonServer + "/lights")
  .then((response) => {
    const responseJson = response.data;
    res.json({ data: responseJson });
  })
  .catch((error) => {
    console.error("Error occurred", error);
      res.status(500).json({ error: "Internal Server Error" });
  });
}

function lightsOff(req: Request, res: Response) {
  axios
    .get(pythonServer + "/lights/false")
    .then((response) => {
      const responseJson = response.data;
      res.json({ data: responseJson });
    })
    .catch((error) => {
      console.error("Error occurred", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
}

function lightsOn(req: Request, res: Response) {
  axios
    .get(pythonServer + "/lights/true")
    .then((response) => {
      const responseJson = response.data;
      res.json({ data: responseJson });
    })
    .catch((error) => {
      console.error("Error occurred", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
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
