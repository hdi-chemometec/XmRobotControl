// main.js / main.ts (the filename doesn't matter)
import { startNodeServer } from "./helperFunctions/helperFunctions";
import { waitForRobotConnection } from "./startUp";

async function main() {
    console.log("Hello world");
    startNodeServer();
    waitForRobotConnection();
  }
  
  if (require.main === module) {
    main();
  }