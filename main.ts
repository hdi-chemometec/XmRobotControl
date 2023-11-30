import { startNodeServer } from "./src/helperFunctions";
import { waitForRobotConnection } from "./src/startUp";

/**
 * Main function
 * Starts the node server and starts the startup process
 */
async function main() {
    console.log("Hello world");
    startNodeServer();
    waitForRobotConnection();
  }
  
  if (require.main === module) {
    main();
  }