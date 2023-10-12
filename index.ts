import express from 'express'; // is used for creating the HTTP server. It runs somewhere and responds to requests
import axios from 'axios'; // Is a HTTP client. It is used for creating web requests

const app = express();

const pythonServer = 'http://127.0.0.1:5000'

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/lightsOff', (req, res) => {
    axios.get(pythonServer+'/lights/false')
        .then((response) => {
        const responseJson = response.data;
        res.json({data: responseJson});
        })
        .catch((error: any) => {
        console.error("Error occured" , error);
        res.status(500).json({error: 'Internal Server Error'});
    });
});

app.get('/lightsOn', (req, res) => {
    axios.get(pythonServer+'/lights/true')
        .then((response) => {
        const responseJson = response.data;
        res.json({data: responseJson});
        })
        .catch((error: any) => {
        console.error("Error occured" , error);
        res.status(500).json({error: 'Internal Server Error'});
    });
});

app.listen(8080, () => {
    console.log('App listening on port 8080!');
});