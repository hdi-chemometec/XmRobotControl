import express from "express"; // is used for creating the HTTP server. It runs somewhere and responds to requests
import axios from "axios"; // Is a HTTP client. It is used for creating web requests
import http from "http";
import { client } from 'websocket';


const PORT = 80;
const app = express();
const server = http.createServer(app);

const clientInstance = new client();

const pythonServer = "http://127.0.0.1:5000";

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/lightsOff", (req, res) => {
  axios
    .get(pythonServer + "/lights/false")
    .then((response) => {
      const responseJson = response.data;
      res.json({ data: responseJson });
    })
    .catch((error: any) => {
      console.error("Error occurred", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

app.get("/lightsOn", (req, res) => {
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
});

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
        };
    });
  
  function sendState() {
    if (connection.connected) {
      const json = JSON.stringify({ type: "STATE" });
      connection.sendUTF(json);
    }
  }
});

server.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

clientInstance.connect(`ws://0.0.0.0:${PORT}/ws`);
