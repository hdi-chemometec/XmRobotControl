import WebSocket from 'ws';
import { wsGetServer, wsGetRobot, wsGetProtocols, wsPostRun, wsRun, wsRunStatus } from "./ws_robot_functions";

/*            Client websocket functions            */
const Client_WS_PORT = 8084;

const wsServer = new WebSocket.Server({ port: Client_WS_PORT });
wsServer.on('connection', (ws: WebSocket) => {
    console.log(`New client connected on PORT ${Client_WS_PORT}`);
  
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