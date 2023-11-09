import axios from "axios"; // library used for making HTTP requests to servers. E.g. the flask server
import WebSocket from 'ws';

const headers = {
  'Content-Type': 'application/json'
}

const pythonServer = "http://127.0.0.1:5000";

async function getIpAddress() {
  try {
    const response = await axios.get(pythonServer + "/connect");
    console.log(response.status);
    console.log(response.data);
    if(response.status == 200) {
      console.log("Invoked python server to check if robot is connected")
    }
  } catch (error) {
    console.log("Axios error occurred ", error);
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
  
async function wsRun(ws: WebSocket, protocol_id: string, command: string) {
  try {
    const body = {"protocol_id": protocol_id, "command": command}
    console.log(body);
    const response = await axios.post(pythonServer + "/command", body, {headers: headers});
    console.log(response.status);
    console.log(response.data);
    if(response.status == 200) {
      const wsResponse = {type: "Command", payload: response.data}
      ws.send(JSON.stringify(wsResponse));
    } else {
      console.error(`Non-200 response from Flask ${response.status}`);
      const wsResponse = {type: "Command", payload: response.data}
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

export { getIpAddress, wsGetServer, wsGetRobot, wsGetProtocols, wsPostRun, wsRun, wsRunStatus };