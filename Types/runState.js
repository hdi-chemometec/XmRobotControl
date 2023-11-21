"use strict";
/**
 * RobotStates
 * @description Enum for the different states a robot can be in.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotStates = void 0;
var RobotStates;
(function (RobotStates) {
    RobotStates["IDLE"] = "idle";
    RobotStates["RUNNING"] = "running";
    RobotStates["PAUSED"] = "paused";
    RobotStates["STOPPED"] = "stopped";
    RobotStates["STOP_REQUESTED"] = "stop requested";
    RobotStates["SUCCEEDED"] = "succeeded";
    RobotStates["FINISHING"] = "finishing";
    RobotStates["UNKNOWN"] = "unknown";
})(RobotStates || (exports.RobotStates = RobotStates = {}));
