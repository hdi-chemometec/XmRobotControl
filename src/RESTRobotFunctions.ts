import axios from "axios"; // library used for making HTTP requests to servers. E.g. the flask server
import WebSocket from 'ws';
import { setRobotState } from "./startUp";

/**
 * headers
 * @description variable used to store the headers for the HTTP requests
 */
const headers = {
  'Content-Type': 'application/json'
}

/**
 * PYTHON_SERVER
 * @description variable used to store the URL of the python server
 */
const PYTHON_SERVER = "http://127.0.0.1:5000";

/**
 * informPythonServerIpUpdate
 * @description function that invokes the python server to check for the robot's IP address
 * This function is used when an IP address is found or removed
 */
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

/**
 * getServer
 * @returns {boolean} connection state of the python server
 * @description function that returns the connection state of the python server
 * This function is used when the node server checks the connection state of the python server
 */
export const getServer = async (): Promise<boolean> => {
  try {
    const response = await axios.get(PYTHON_SERVER + "/");
    if(response.status == 200) {
      console.log(`Python server is running ${response.status}`);
      return true;
    } else {
    return false;
  }
  } catch (error) {
    console.error("getServer: Error, Python server is not running");
    return false;
  }
}

/**
 * wsGetServer
 * @param ws - websocket instance
 * This function gets the python connection state and sends it's state as a response to the ws client
 * if it fails to get the connection state, it sends the request back to the ws client
 */
export async function wsGetServer(ws: WebSocket) {
  try {
    const response = await axios.get(PYTHON_SERVER + "/");
    if(response.status == 200) {
      const wsResponse = {type: "SERVER", content: response.data}
      ws.send(JSON.stringify(wsResponse));
    }
  } catch (error) {
    console.error("wsGetServer: Error, Axios error occurred");
  }
}

/**
 * wsGetRobot
 * @param ws - websocket instance
 * This function gets the robot connection state and sends it's state as a response to the ws client
 * if it fails to get the connection state, it sends the request back to the ws client
 */
export async function wsGetRobot(ws: WebSocket): Promise<boolean> {
  try {
    const response = await axios.get(PYTHON_SERVER + "/connect");
    if(response.status == 200) {
      const wsResponse = {type: "ROBOT", content: response.data}
      ws.send(JSON.stringify(wsResponse));
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("wsGetRobot: Error, Axios error occurred");
    return false;
  }
}

/**
 * 
 * @param ws - websocket instance
 * This function gets the robot protocol list and sends it as a response to the ws client
 * if it fails to get the protocol list, it sends the request back to the ws client
 */
export async function wsGetProtocols(ws: WebSocket) {
  try {
    const response = await axios.get(PYTHON_SERVER + "/protocols");
    if(response.status == 200) {
      const wsResponse = {type: "PROTOCOLS", content: response.data}
      ws.send(JSON.stringify(wsResponse));
    }
  } catch (error) {
    if(axios.isAxiosError(error)) {
      if(error.response?.status == 404) {
        console.log(error.response?.data);
        return;
      }
    }
    console.error("wsGetProtocols: Error, Axios error occurred");    
  }
}

/**
 * wsPostRun
 * @param ws - websocket instance
 * @param protocol_id - protocol id of the protocol to be run
 * This function posts a run request to the python server and sends the response to the ws client
 * if it fails to post the run request, it sends the request back to the ws client
 */
export async function wsPostRun(ws: WebSocket, protocol_id: string) {
  try {
    const body = {"protocol_id": protocol_id}
    const response = await axios.post(PYTHON_SERVER + "/runs", body, {headers: headers});
    if(response.status == 201) {
      const wsResponse = {type: "RUN", content: response.data}
      ws.send(JSON.stringify(wsResponse));
    }
  } catch (error) {
    if(axios.isAxiosError(error)) {
      if(error.response?.status == 404) {
        console.log(error.response?.data);
        return;
      }
    }
    console.error("wsPostRun: Error, Axios error occurred");    
  }
}

/**
 * wsRun
 * @param ws - websocket instance
 * @param protocol_id - protocol id of the protocol to be run
 * @param command - command to be sent to the robot
 * This function posts a command to the python server and sends the response to the ws client
 * if it fails to post the command, it sends the request back to the ws client
 */
export async function wsRun(ws: WebSocket, protocol_id: string, command: string) {
  try {
    const body = {"protocol_id": protocol_id, "command": command}
    const response = await axios.post(PYTHON_SERVER + "/command", body, {headers: headers});
    
    if(response.status == 201) {
      console.log("Command sent to robot");
      const wsResponse = {type: "COMMAND", content: response.data}
      ws.send(JSON.stringify(wsResponse));
    }
  } catch (error) {
    if(axios.isAxiosError(error)) {
      if(error.response?.status == 404) {
        console.log(error.response?.data);
        return;
      }
    }
    console.error("wsRun: Error, Axios error occurred");
  }
}


/**
 * wsRunStatus
 * @param ws - websocket instance
 * This function gets the robot run status and sends it as a response to the ws client
 * if it fails to get the run status, it returns the state UNKNOWN
 */
export async function wsRunStatus(ws: WebSocket) {
  try {
    const response = await axios.get(PYTHON_SERVER + "/runStatus");
    if(response.status == 200) {
      const wsResponse = {type: "RUN_STATUS", content: response.data}
      setRobotState(response.data);
      ws.send(JSON.stringify(wsResponse));
     } 
    } catch (error) { // NOTE: axios will see all non-200 responses as errors
    if(axios.isAxiosError(error)) {
      if(error.response?.status == 404 || error.response?.status == 400) {
        console.log(error.response?.data);
        return;
      }
    }
    console.error("wsRunStatus: Error, Axios error occurred");
  }
}

/**
 * sendCommand
 * @param command - command to be sent to the robot
 * This function posts a command to the python server
 * if it fails to post the command, it sends the request back to the ws client
 */
export async function sendCommand( command: string) {
  try {
    const body = {"command": command}
    const response = await axios.post(PYTHON_SERVER + "/command", body, {headers: headers});
    if(response.status == 201) {
      console.log("Command sent to robot");
      const wsResponse = {type: "COMMAND", content: response.data}
      console.log(wsResponse);
    }
  } catch (error) { // NOTE: axios will see all non-200 responses as errors
      if(axios.isAxiosError(error)) {
        if(error.response?.status == 404 || error.response?.status == 403) {
          console.log(error.response?.data);
          return;
        }
      }
    console.error("sendCommand: Error, Axios error occurred");
  }
}
