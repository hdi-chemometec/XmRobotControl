"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstrumentStates = void 0;
/**
 * InstrumentStates
 * @description Enum for the different states of an instrument
 */
var InstrumentStates;
(function (InstrumentStates) {
    InstrumentStates["IDLE"] = "IDLE";
    InstrumentStates["BUSY"] = "BUSY";
    InstrumentStates["INTRANSITION"] = "INTRANSITION";
    InstrumentStates["UNKNOWN"] = "UNKNOWN";
    InstrumentStates["NO_STATE"] = "NO_STATE";
    InstrumentStates["ERROR"] = "ERROR";
})(InstrumentStates || (exports.InstrumentStates = InstrumentStates = {}));
