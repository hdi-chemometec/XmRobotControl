import express, { Express, Request, Response } from "express"; // is a web app framework used for building APIs.
import axios from "axios"; // library used for making HTTP requests to servers. E.g. the flask server

const app: Express = express();

const pythonServer = "http://127.0.0.1:5000";

const headers = {
  'Content-Type': 'application/json'
}

app.get("/server", get_server);
app.get("/protocols", get_protocols);
app.get("/runs", get_runs);
app.post("/runs", post_run);
app.post("/execute", post_execute);
app.get("/runStatus", get_runStatus);
app.get('/lights', get_lights);
app.post('/lights', post_lights);


function get_server(req: Request, res: Response) {
    console.log("Called get_server");
    axios
      .get(pythonServer + "/")
      .then((response) => {
        const responseJson = response.data;
        const responseString = responseJson.toString();
        return responseString;
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
  