"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const startUp_1 = require("./src/startUp");
const startUp_2 = require("./src/startUp");
/**
 * Main function
 * Starts the node server and starts the startup process
 */
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Hello world");
        (0, startUp_1.startNodeServer)();
        (0, startUp_2.waitForRobotConnection)();
    });
}
if (require.main === module) {
    main();
}
