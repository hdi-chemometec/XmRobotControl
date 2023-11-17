// main.js / main.ts (the filename doesn't matter)
import { startNodeServer } from "./helper_functions/helperFunctions";
import { waitForRobotConnection } from "./index";

async function main() {
    console.log("Hello world");
    startNodeServer();
    waitForRobotConnection();
  }
  
  if (require.main === module) {
    main();
  }