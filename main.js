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
// main.js / main.ts (the filename doesn't matter)
const helperFunctions_1 = require("./helper_functions/helperFunctions");
const startUp_1 = require("./startUp");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Hello world");
        (0, helperFunctions_1.startNodeServer)();
        (0, startUp_1.waitForRobotConnection)();
    });
}
if (require.main === module) {
    main();
}
