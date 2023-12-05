import { startNodeServer } from "./src/startUp";
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