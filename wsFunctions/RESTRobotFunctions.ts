import axios from "axios"; // library used for making HTTP requests to servers. E.g. the flask server
import WebSocket from 'ws';
import { setRobotState } from "../startUp";
import { RobotStates } from "../Types/runState";

const headers = {
  'Content-Type': 'application/json'
}

const PYTHON_SERVER = "http://127.0.0.1:5000";

export async function informPythonServerIpUpdate() {
  try {
    const response = await axios.get(PYTHON_SERVER + "/connect");
    if(response.status == 200) {
      console.log("Invoked python server to check if robot is connected")
    }
  } catch (error) {
    console.log("informPythonServerIpUpdate: Error, Python server is not running");
  }
}

export const getServer = async (): Promise<boolean> => {
  try {
    const response = await axios.get(PYTHON_SERVER + "/");
    if(response.status == 200) {
      console.log(`Python server is running ${response.status}`);
      return true;
    } else {
      console.log(`Non-200 response from Flask ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error("getServer: Error, Python server is not running");
    return false;
  }
}

export async function wsGetServer(ws: WebSocket) {
  try {
    const response = await axios.get(PYTHON_SERVER + "/");
    if(response.status == 200) {
      const wsResponse = {type: "SERVER", content: response.data}
      ws.send(JSON.stringify(wsResponse));
    } else {
      const wsResponse = {type: "SERVER", content: response.data}
      console.error(`Non-200 response from Flask ${response.status}`);
      ws.send(JSON.stringify(wsResponse));
    }
  } catch (error) {
    console.error("wsGetServer: Error, Axios error occurred");
  }
}

export async function wsGetRobot(ws: WebSocket): Promise<boolean> {
  try {
    const response = await axios.get(PYTHON_SERVER + "/connect");
    if(response.status == 200) {
      const wsResponse = {type: "ROBOT", content: response.data}
      ws.send(JSON.stringify(wsResponse));
      return true;
    } else {
      console.error(`Non-200 response from Flask ${response.status}`);
      const wsResponse = {type: "ROBOT", content: response.data}
      ws.send(JSON.stringify(wsResponse));
      return false;
    }
  } catch (error) {
    console.error("wsGetRobot: Error, Axios error occurred");
    return false;
  }
}

export async function wsGetProtocols(ws: WebSocket) {
  try {
    const response = await axios.get(PYTHON_SERVER + "/protocols");
    if(response.status == 200) {
      const wsResponse = {type: "PROTOCOLS", content: response.data}
      ws.send(JSON.stringify(wsResponse));
    } else {
      console.error(`Non-200 response from Flask ${response.status}`);
      const wsResponse = {type: "PROTOCOLS", content: response.data}
      ws.send(JSON.stringify(wsResponse));
    }
  } catch (error) {
    console.error("wsGetProtocols: Error, Axios error occurred");    
  }
}

export async function wsPostRun(ws: WebSocket, protocol_id: string) {
  try {
    const body = {"protocol_id": protocol_id}
    const response = await axios.post(PYTHON_SERVER + "/runs", body, {headers: headers});
    if(response.status == 201) {
      const wsResponse = {type: "RUN", content: response.data}
      ws.send(JSON.stringify(wsResponse));
    } else {
      console.error(`Non-201 response from Flask ${response.status}`);
      const wsResponse = {type: "RUN", content: response.data}
      ws.send(JSON.stringify(wsResponse));
    }
  } catch (error) {
    console.error("wsPostRun: Error, Axios error occurred");    
  }
}
  
export async function wsRun(ws: WebSocket, protocol_id: string, command: string) {
  try {
    const body = {"protocol_id": protocol_id, "command": command}
    const response = await axios.post(PYTHON_SERVER + "/command", body, {headers: headers});
    if(response.status == 201) {
      console.log("Command sent to robot");
      const wsResponse = {type: "COMMAND", content: response.data}
      ws.send(JSON.stringify(wsResponse));
    } else {
      console.error(`Non-201 response from Flask ${response.status}`);
      const wsResponse = {type: "COMMAND", content: response.data}
      ws.send(JSON.stringify(wsResponse));
    }
  } catch (error) {
    console.error("wsRun: Error, Axios error occurred");
  }
}

export async function sendCommand( command: string) {
  try {
    const body = {"command": command}
    const response = await axios.post(PYTHON_SERVER + "/command", body, {headers: headers});
    if(response.status == 201) {
      console.log("Command sent to robot");
      const wsResponse = {type: "COMMAND", content: response.data}
      console.log(wsResponse);
    } else {
      console.error(`Non-201 response from Flask ${response.status}`);
      const wsResponse = {type: "COMMAND", content: response.data}
      console.error(wsResponse);
    }
  } catch (error) {
    console.error("sendCommand: Error, Axios error occurred");
  }
}

export async function wsRunStatus(ws: WebSocket) {
  try {
    const response = await axios.get(PYTHON_SERVER + "/runStatus");
    if(response.status == 200) {
      const wsResponse = {type: "RUN_STATUS", content: response.data}
      setRobotState(response.data);
      ws.send(JSON.stringify(wsResponse));
    } else {
      const wsResponse = {type: "RUN_STATUS", content: RobotStates.UNKNOWN}
      ws.send(JSON.stringify(wsResponse));
    }
  } catch (error) {
    console.error("wsRunStatus: Error, Axios error occurred");
  }
}