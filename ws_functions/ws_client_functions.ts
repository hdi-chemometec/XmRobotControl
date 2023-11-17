import WebSocket from 'ws';
import { wsGetServer, wsGetRobot, wsGetProtocols, wsPostRun, wsRun, wsRunStatus } from "./REST_robot_functions";
import { fromServerSendMessageToInstrument } from './ws_instrument_functions';
import  { shouldFlowStart, startControlFlow } from '../helper_functions/flowControl';

/*            Client websocket functions            */
let wsClient: boolean = false;
const connectedClients = new Set<WebSocket>();
let globalWs: WebSocket;

export function getWsClient(): boolean {
  return wsClient;
}

function setWsClient(state: boolean) {
  wsClient = state;
}

export function startClientServer(){
  const Client_WS_PORT = 8084;
  const wsServer = new WebSocket.Server({ port: Client_WS_PORT });

  wsServer.on('connection', (ws: WebSocket) => {
      console.log(`New client connected on PORT ${Client_WS_PORT}`);
      setWsClient(true);
      globalWs = ws;
      connectedClients.add(ws);
    
      ws.on('message', (message: string) => {
        console.log(`Received message: ${message}`);
        handleWsMessages(message, ws);
      });
    
      ws.on('close', () => {
        console.log('Client disconnected');
      });      

      function fetchRunStatus() { //pulling run status from robot
        wsRunStatus(globalWs);
      }

        setInterval(fetchRunStatus, 1000);

    function handleWsMessages(message: string, ws: WebSocket) {
      const json = JSON.parse(message);
      console.log("Received message from client: ",json.type);
      switch (json.type) {
        case "PING":{
          const response =JSON.stringify({ type: "PING", content: "PONG" });
          ws.send(response);
          break;}
        case "SERVER":{
          wsGetServer(ws);
          break;
        }
        case "ROBOT":{
          wsGetRobot(ws);
          break;
        }
        case "PROTOCOLS":{
          wsGetProtocols(ws);
          break;
        }
        case "RUN": {
          const protocol_id = json.protocolId;
          wsPostRun(ws, protocol_id);
          break;
        }
        case "RUN_STATUS": {
          wsRunStatus(ws);
          break;
        }
        case "COMMAND": {
          const protocol_id = json.protocolId;
          const command = json.command;
          if(shouldFlowStart()) {
            console.log("Flow should start");
            wsRun(ws, protocol_id, command);
            console.log("CONTROL BEGINS");
            startControlFlow();
          } else {
            console.log("Flow should not start");
            const response = JSON.stringify({type: "COMMAND", content: "stop"});
            ws.send(response);
          }
          break;
        }
        case "STATE": {
          fromServerSendMessageToInstrument("STATE");
          break;
        }
        default:
          console.log("Default");
          break;
        }
    }
  });
}

export const sendMessageToClient = function (data: string): void {
  try {
    const jsonString = JSON.stringify(data);
    connectedClients.forEach((client: WebSocket) => {
      console.log("Sending message to client: ", jsonString);
      client.send(jsonString);
    });
  } catch (error) {
    console.error("Client is not connected");
  }
};