"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowInstrumentStates = exports.FlowRobotStates = void 0;
var FlowRobotStates;
(function (FlowRobotStates) {
    FlowRobotStates["START"] = "START";
    FlowRobotStates["FETCHING_SAMPLE"] = "FETCHING_SAMPLE";
    FlowRobotStates["DROP_SAMPLE"] = "DROP_SAMPLE";
    FlowRobotStates["WAITING_FOR_INSTRUMENT"] = "WAITING_FOR_INSTRUMENT";
    FlowRobotStates["FINISHING"] = "FINISHING";
})(FlowRobotStates || (exports.FlowRobotStates = FlowRobotStates = {}));
var FlowInstrumentStates;
(function (FlowInstrumentStates) {
    FlowInstrumentStates["NOT_INITIALIZED"] = "NOT_INITIALIZED";
    FlowInstrumentStates["INITIALIZE_CALLED"] = "INITIALIZE_CALLED";
    FlowInstrumentStates["READY"] = "READY";
    FlowInstrumentStates["ANALYZE_SAMPLE"] = "ANALYZE_SAMPLE";
    FlowInstrumentStates["ANALYZE_SAMPLE_DONE"] = "ANALYZE_SAMPLE_DONE";
    FlowInstrumentStates["DONE"] = "DONE";
})(FlowInstrumentStates || (exports.FlowInstrumentStates = FlowInstrumentStates = {}));
