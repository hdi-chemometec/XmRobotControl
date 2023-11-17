import { Message, client, connection } from 'websocket';

const WS_PORT = 80;

const clientInstance = new client();

//      Websocket functions     //
clientInstance.on("connectFailed", function (error) {
  console.log("Connect Error: " + error.toString());
});

clientInstance.on("connect", function (connection) {
    console.log("WebSocket Client Connected");
    transmitMessageState(connection);

    connection.on("error", function (error) {
        console.log("Connection Error: " + error.toString());
    });

    connection.on("close", function () {
        console.log("Connection closed");
    });

    connection.on("message", function (message) {
        handleReceivedMessage(message);  
    });
});

function transmitMessageState(connection: connection) {
    if (connection.connected) {
      const json = JSON.stringify({ type: "STATE" });
      connection.sendUTF(json);
    }
}

  function handleReceivedMessage(message: Message) {
    console.log("State message received: ", message);
}

clientInstance.connect(`ws://0.0.0.0:${WS_PORT}/ws`);