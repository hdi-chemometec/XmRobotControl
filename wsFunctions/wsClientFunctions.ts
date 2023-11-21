import WebSocket from 'ws';
import { wsGetServer, wsGetRobot, wsGetProtocols, wsPostRun, wsRun, wsRunStatus } from "./RESTRobotFunctions";
import { fromServerSendMessageToInstrument } from './wsInstrumentFunctions';
import  { shouldFlowStart, startControlFlow } from '../helperFunctions/flowControl';
import { reconnectToClient } from '../startUp';

/*            Client websocket functions            */

/**
 * connectedClients
 * @description variable used to store the connected clients
 */
const connectedClients = new Set<WebSocket>();

/**
 * wsClient
 * @description variable describing the current state of the client connection
 * @type {boolean}
 * @default false
 * getWsClient: returns the wsClient variable
 * setWsClient: sets the wsClient variable
 */
let wsClient: boolean = false;
export function getWsClient(): boolean {
  return wsClient;
}
function setWsClient(state: boolean) {
  wsClient = state;
}

/**
 * startClientServer
 * @description function that starts the client server on port 8084
 * The function is called in the startUp.ts file when waiting for the client to connect
 */
export function startClientServer(){
  const CLIENT_WS_PORT = 8084;
  const wsServer = new WebSocket.Server({ port: CLIENT_WS_PORT });

  wsServer.on('connection', (ws: WebSocket) => {
      console.log(`New client connected on PORT ${CLIENT_WS_PORT}`);
      setWsClient(true);
      connectedClients.add(ws);
    
      ws.on('message', (message: string) => {
        console.log(`Received message: ${message}`);
        handleWsMessages(message, ws);
      });
    
      ws.on('close', () => {
        console.log('Client disconnected');
        setWsClient(false);
        reconnectToClient();
      });      

      /**
       * fetchRunStatus
       * @description function that fetches the run status from the robot
       * The function is called every 2 seconds
       */
      function fetchRunStatus() { //pulling run status from robot
        wsRunStatus(ws);
      }

      setInterval(fetchRunStatus, 2000);

    /**
     * handleWsMessages
     * @param message - message received from the client
     * @param ws - websocket instance
     * @description function that handles the messages received from the client
     */
    function handleWsMessages(message: string, ws: WebSocket) {
      try {
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
            const protocolId = json.protocolId;
            wsPostRun(ws, protocolId);
            break;
          }
          case "RUN_STATUS": {
            wsRunStatus(ws);
            break;
          }
          case "COMMAND": {
            const protocolId = json.protocolId;
            const command = json.command;
            if(shouldFlowStart()) {
              console.log("Flow should start");
              wsRun(ws, protocolId, command);
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
            console.log("default: handleWsMessages");
            ws.send("Error: Invalid message type");
            break;
        }
      } catch (error) {
        console.error("handleWsMessages: WS client message error");
        ws.send("Error: Invalid message");
      }
    }
  });
}

/**
 * sendMessageToClient
 * @param message - data to send to the client
 * @description function that sends a message to the client
 * The function is called in the wsInstrumentFunctions.ts file when the instrument sends a message to the server
 * e.g. when the state of the instrument changes, the instrument sends a message to the server and this function forwards it to the client
 */
export const sendMessageToClient = function (message: string): void {
  try {
    const jsonString = JSON.stringify(message);
    connectedClients.forEach((client: WebSocket) => {
      console.log("Sending message to client: ", jsonString);
      client.send(jsonString);
    });
  } catch (error) {
    console.error("Client is not connected");
  }
};