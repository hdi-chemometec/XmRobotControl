"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startControlFlow = exports.shouldFlowStart = void 0;
const flowstates_1 = require("../Types/flowstates");
const instrumentStates_1 = require("../Types/instrumentStates");
const runState_1 = require("../Types/runState");
const index_1 = require("../index");
const ws_instrument_functions_1 = require("../ws_functions/ws_instrument_functions");
const ws_robot_functions_1 = require("../ws_functions/ws_robot_functions");
let flowInstrumentState = flowstates_1.FlowInstrumentStates.NOT_INITIALIZED;
const getFlowInstrumentState = () => {
    return flowInstrumentState;
};
const setFlowInstrumentState = (newState) => {
    console.log("set instrument state: ", newState);
    flowInstrumentState = newState;
};
let flowRobotState = flowstates_1.FlowRobotStates.START;
const getFlowRobotState = () => {
    return flowRobotState;
};
const setFlowRobotState = (newState) => {
    console.log("set robot state: ", newState);
    flowRobotState = newState;
};
const shouldFlowStart = () => {
    const instrument = (0, index_1.getInstrumentState)();
    const robot = (0, index_1.getRobotState)();
    if (instrument == instrumentStates_1.InstrumentStates.UNKNOWN && robot == runState_1.RobotStates.IDLE) {
        return true;
    }
    else {
        return false;
    }
};
exports.shouldFlowStart = shouldFlowStart;
function startControlFlow() {
    setTimeout(function () {
        const flowRobot = getFlowRobotState();
        const flowInstrument = getFlowInstrumentState();
        handleRobotState(flowRobot);
        console.log("Flow robot state: ", getFlowRobotState());
        console.log("Flow instrument state: ", getFlowInstrumentState());
        if (flowInstrument != flowstates_1.FlowInstrumentStates.DONE) {
            startControlFlow();
        }
    }, 2000);
    console.log("\n");
}
exports.startControlFlow = startControlFlow;
const handleRobotState = (robotState) => {
    const robot = (0, index_1.getRobotState)();
    if (robot == runState_1.RobotStates.FINISHING && flowRobotState != flowstates_1.FlowRobotStates.FINISHING) { //check if robot is finishing and only set if it is not already set
        setFlowRobotState(flowstates_1.FlowRobotStates.FINISHING);
    }
    switch (robotState) {
        case flowstates_1.FlowRobotStates.START: {
            if (robot == runState_1.RobotStates.PAUSED) { //this happens from run 2 and onwards as the robot stops after dropping the pipette
                (0, ws_robot_functions_1.sendCommand)("play");
            }
            else if (robot == runState_1.RobotStates.RUNNING) { // this happens in the first run
                setFlowRobotState(flowstates_1.FlowRobotStates.FETCHING_SAMPLE);
                const flowInstrument = getFlowInstrumentState(); //Check if startup for instrument happens correctly
                handleInstrumentState(flowInstrument);
            }
            break;
        }
        case flowstates_1.FlowRobotStates.FETCHING_SAMPLE: {
            if (robot == runState_1.RobotStates.PAUSED) { //robot has fetched sample
                const flowInstrument = getFlowInstrumentState();
                handleInstrumentState(flowInstrument);
            }
            break;
        }
        case flowstates_1.FlowRobotStates.DROP_SAMPLE: {
            const instrument = (0, index_1.getInstrumentState)();
            if (instrument == instrumentStates_1.InstrumentStates.IDLE && flowInstrumentState == flowstates_1.FlowInstrumentStates.READY) { //when instrument is ready, drop sample
                (0, ws_robot_functions_1.sendCommand)("play");
                setFlowInstrumentState(flowstates_1.FlowInstrumentStates.ANALYZE_SAMPLE);
            }
            else if (robot == runState_1.RobotStates.PAUSED || robot == runState_1.RobotStates.FINISHING) { //we must wait for the robot to be done dropping the sample before analyzing
                setFlowRobotState(flowstates_1.FlowRobotStates.WAITING_FOR_INSTRUMENT);
                const flowInstrument = getFlowInstrumentState();
                handleInstrumentState(flowInstrument);
            }
            break;
        }
        case flowstates_1.FlowRobotStates.WAITING_FOR_INSTRUMENT: {
            const flowInstrument = getFlowInstrumentState();
            handleInstrumentState(flowInstrument);
            break;
        }
        case flowstates_1.FlowRobotStates.FINISHING: {
            const flowInstrument = getFlowInstrumentState();
            if (flowInstrument == flowstates_1.FlowInstrumentStates.DONE) {
                return;
            }
            handleInstrumentState(flowInstrument);
            break;
        }
        default: {
            break;
        }
    }
};
const handleInstrumentState = (instrumentState) => {
    switch (instrumentState) {
        case flowstates_1.FlowInstrumentStates.NOT_INITIALIZED: {
            const flowRobot = getFlowRobotState();
            if (flowRobot == flowstates_1.FlowRobotStates.FINISHING) { //check if robot has finished
                setFlowInstrumentState(flowstates_1.FlowInstrumentStates.DONE);
            }
            const instrument = (0, index_1.getInstrumentState)();
            if (instrument == instrumentStates_1.InstrumentStates.UNKNOWN) { //if instrument is not initialized, initialize it
                (0, ws_instrument_functions_1.fromServerSendMessageToInstrument)("INITIALIZE");
                setFlowInstrumentState(flowstates_1.FlowInstrumentStates.INITIALIZE_CALLED);
            }
            else if (instrument == instrumentStates_1.InstrumentStates.IDLE) { //if instrument is initialized, set instrument state to ready
                setFlowInstrumentState(flowstates_1.FlowInstrumentStates.READY);
            }
            break;
        }
        case flowstates_1.FlowInstrumentStates.INITIALIZE_CALLED: {
            const instrument = (0, index_1.getInstrumentState)();
            if (instrument == instrumentStates_1.InstrumentStates.IDLE) { // instrument is initialized
                setFlowInstrumentState(flowstates_1.FlowInstrumentStates.READY);
            }
            else { //in case instrument times out during initialization
                setFlowInstrumentState(flowstates_1.FlowInstrumentStates.NOT_INITIALIZED);
            }
            break;
        }
        case flowstates_1.FlowInstrumentStates.READY: {
            const flowRobot = getFlowRobotState();
            if (flowRobot == flowstates_1.FlowRobotStates.WAITING_FOR_INSTRUMENT || flowRobot == flowstates_1.FlowRobotStates.FINISHING) {
                setFlowInstrumentState(flowstates_1.FlowInstrumentStates.ANALYZE_SAMPLE);
                break;
            }
            setFlowRobotState(flowstates_1.FlowRobotStates.DROP_SAMPLE);
            break;
        }
        case flowstates_1.FlowInstrumentStates.ANALYZE_SAMPLE: {
            const instrument = (0, index_1.getInstrumentState)();
            if (instrument == instrumentStates_1.InstrumentStates.UNKNOWN) {
                setFlowInstrumentState(flowstates_1.FlowInstrumentStates.NOT_INITIALIZED);
                break;
            }
            const robot = (0, index_1.getRobotState)();
            if ((robot == runState_1.RobotStates.PAUSED || flowRobotState == flowstates_1.FlowRobotStates.FINISHING) && instrument == instrumentStates_1.InstrumentStates.IDLE) {
                (0, ws_instrument_functions_1.fromServerSendMessageToInstrument)("RUN");
                setFlowInstrumentState(flowstates_1.FlowInstrumentStates.ANALYZE_SAMPLE_DONE);
            }
            break;
        }
        case flowstates_1.FlowInstrumentStates.ANALYZE_SAMPLE_DONE: {
            const instrument = (0, index_1.getInstrumentState)();
            if (instrument == instrumentStates_1.InstrumentStates.IDLE) { //analyzing is done when instrument is idle
                if (getFlowRobotState() == flowstates_1.FlowRobotStates.FINISHING) { //if robot is finished then instrument is done
                    setFlowInstrumentState(flowstates_1.FlowInstrumentStates.DONE);
                    break;
                }
                setFlowRobotState(flowstates_1.FlowRobotStates.START);
                setFlowInstrumentState(flowstates_1.FlowInstrumentStates.NOT_INITIALIZED);
            }
            break;
        }
        case flowstates_1.FlowInstrumentStates.DONE: {
            return;
        }
        default: {
            console.log("Default");
            break;
        }
    }
};
