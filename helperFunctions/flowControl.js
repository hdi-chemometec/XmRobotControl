"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startControlFlow = exports.shouldFlowStart = void 0;
const flowStates_1 = require("../Types/flowStates");
const instrumentStates_1 = require("../Types/instrumentStates");
const runState_1 = require("../Types/runState");
const startUp_1 = require("../startUp");
const wsInstrumentFunctions_1 = require("../wsFunctions/wsInstrumentFunctions");
const RESTRobotFunctions_1 = require("../wsFunctions/RESTRobotFunctions");
/**
 * flowInstrumentState
 * @description variable describing the current flow state of the instrument
 * @type {FlowInstrumentStates}
 * @default FlowInstrumentStates.NOT_INITIALIZED
 * getFlowInstrumentState: returns the flowInstrumentState variable
 * setFlowInstrumentState: sets the flowInstrumentState variable
 */
let flowInstrumentState = flowStates_1.FlowInstrumentStates.NOT_INITIALIZED;
const getFlowInstrumentState = () => {
    return flowInstrumentState;
};
const setFlowInstrumentState = (newState) => {
    flowInstrumentState = newState;
};
/**
 * flowRobotState
 * @description variable describing the current flow state of the robot
 * @type {FlowRobotStates}
 * @default FlowRobotStates.START
 * getFlowRobotState: returns the flowRobotState variable
 * setFlowRobotState: sets the flowRobotState variable
 */
let flowRobotState = flowStates_1.FlowRobotStates.START;
const getFlowRobotState = () => {
    return flowRobotState;
};
const setFlowRobotState = (newState) => {
    flowRobotState = newState;
};
/**
 * shouldFlowStart
 * @returns {boolean} true if the flow control should start
 * The flow should only start if the is idle and the robot is either idle or unknown state
 */
const shouldFlowStart = () => {
    const instrument = (0, startUp_1.getInstrumentState)();
    const robot = (0, startUp_1.getRobotState)();
    if ((instrument == instrumentStates_1.InstrumentStates.UNKNOWN || instrument == instrumentStates_1.InstrumentStates.IDLE) && robot == runState_1.RobotStates.IDLE) {
        return true;
    }
    else {
        return false;
    }
};
exports.shouldFlowStart = shouldFlowStart;
/**
 * startControlFlow
 * @description function that starts and controls the flow of the robot and instrument
 * The function is sequentially called every 2 seconds until the flow is done
 * The flow is done when the robot is in the finishing flow state and the instrument is in the done flow state
 */
function startControlFlow() {
    setTimeout(function () {
        const flowRobot = getFlowRobotState();
        const flowInstrument = getFlowInstrumentState();
        handleRobotState(flowRobot);
        console.log("Flow robot state: ", getFlowRobotState());
        console.log("Flow instrument state: ", getFlowInstrumentState());
        if (flowInstrument != flowStates_1.FlowInstrumentStates.DONE) {
            startControlFlow();
        }
        else { //reset states
            setFlowInstrumentState(flowStates_1.FlowInstrumentStates.NOT_INITIALIZED);
            setFlowRobotState(flowStates_1.FlowRobotStates.START);
        }
    }, 2000);
    console.log("\n");
}
exports.startControlFlow = startControlFlow;
/**
 * handleRobotState
 * @param robotState - current flow state of the robot
 * @description function that handles the flow state of the robot
 */
const handleRobotState = (robotState) => {
    const robot = (0, startUp_1.getRobotState)();
    if (robot == runState_1.RobotStates.FINISHING && flowRobotState != flowStates_1.FlowRobotStates.FINISHING) { //check if robot is finishing and only set if it is not already set
        setFlowRobotState(flowStates_1.FlowRobotStates.FINISHING);
    }
    switch (robotState) {
        case flowStates_1.FlowRobotStates.START: {
            if (robot == runState_1.RobotStates.PAUSED) { //this happens from run 2 and onwards as the robot stops after dropping the pipette
                (0, RESTRobotFunctions_1.sendCommand)("play");
            }
            else if (robot == runState_1.RobotStates.RUNNING) { // this happens in the first run
                setFlowRobotState(flowStates_1.FlowRobotStates.FETCHING_SAMPLE);
                const flowInstrument = getFlowInstrumentState(); //Check if startup for instrument happens correctly
                handleInstrumentState(flowInstrument);
            }
            break;
        }
        case flowStates_1.FlowRobotStates.FETCHING_SAMPLE: {
            if (robot == runState_1.RobotStates.PAUSED) { //robot has fetched sample
                const flowInstrument = getFlowInstrumentState();
                handleInstrumentState(flowInstrument);
            }
            break;
        }
        case flowStates_1.FlowRobotStates.DROP_SAMPLE: {
            const instrument = (0, startUp_1.getInstrumentState)();
            if (instrument == instrumentStates_1.InstrumentStates.IDLE && flowInstrumentState == flowStates_1.FlowInstrumentStates.READY) { //when instrument is ready, drop sample
                (0, RESTRobotFunctions_1.sendCommand)("play");
                setFlowInstrumentState(flowStates_1.FlowInstrumentStates.ANALYZE_SAMPLE);
            }
            else if (robot == runState_1.RobotStates.PAUSED || robot == runState_1.RobotStates.FINISHING) { //we must wait for the robot to be done dropping the sample before analyzing
                setFlowRobotState(flowStates_1.FlowRobotStates.WAITING_FOR_INSTRUMENT);
                const flowInstrument = getFlowInstrumentState();
                handleInstrumentState(flowInstrument);
            }
            break;
        }
        case flowStates_1.FlowRobotStates.WAITING_FOR_INSTRUMENT: {
            const flowInstrument = getFlowInstrumentState();
            handleInstrumentState(flowInstrument);
            break;
        }
        case flowStates_1.FlowRobotStates.FINISHING: {
            const flowInstrument = getFlowInstrumentState();
            if (flowInstrument == flowStates_1.FlowInstrumentStates.DONE) {
                return;
            }
            handleInstrumentState(flowInstrument);
            break;
        }
        default: {
            console.log("Instrument State: Default");
            break;
        }
    }
};
/**
 * handleInstrumentState
 * @param instrumentState - current flow state of the instrument
 * @description function that handles the flow state of the instrument
 */
const handleInstrumentState = (instrumentState) => {
    switch (instrumentState) {
        case flowStates_1.FlowInstrumentStates.NOT_INITIALIZED: {
            const flowRobot = getFlowRobotState();
            if (flowRobot == flowStates_1.FlowRobotStates.FINISHING) { //check if robot has finished
                setFlowInstrumentState(flowStates_1.FlowInstrumentStates.DONE);
            }
            const instrument = (0, startUp_1.getInstrumentState)();
            if (instrument == instrumentStates_1.InstrumentStates.UNKNOWN) { //if instrument is not initialized, initialize it
                (0, wsInstrumentFunctions_1.fromServerSendMessageToInstrument)("INITIALIZE");
                setFlowInstrumentState(flowStates_1.FlowInstrumentStates.INITIALIZE_CALLED);
            }
            else if (instrument == instrumentStates_1.InstrumentStates.IDLE) { //if instrument is initialized, set instrument state to ready
                setFlowInstrumentState(flowStates_1.FlowInstrumentStates.READY);
            }
            break;
        }
        case flowStates_1.FlowInstrumentStates.INITIALIZE_CALLED: {
            const instrument = (0, startUp_1.getInstrumentState)();
            if (instrument == instrumentStates_1.InstrumentStates.IDLE) { // instrument is initialized
                setFlowInstrumentState(flowStates_1.FlowInstrumentStates.READY);
            }
            else { //in case instrument times out during initialization
                setFlowInstrumentState(flowStates_1.FlowInstrumentStates.NOT_INITIALIZED);
            }
            break;
        }
        case flowStates_1.FlowInstrumentStates.READY: {
            const flowRobot = getFlowRobotState();
            if (flowRobot == flowStates_1.FlowRobotStates.WAITING_FOR_INSTRUMENT || flowRobot == flowStates_1.FlowRobotStates.FINISHING) {
                setFlowInstrumentState(flowStates_1.FlowInstrumentStates.ANALYZE_SAMPLE);
                break;
            }
            setFlowRobotState(flowStates_1.FlowRobotStates.DROP_SAMPLE);
            break;
        }
        case flowStates_1.FlowInstrumentStates.ANALYZE_SAMPLE: {
            const instrument = (0, startUp_1.getInstrumentState)();
            if (instrument == instrumentStates_1.InstrumentStates.UNKNOWN) {
                setFlowInstrumentState(flowStates_1.FlowInstrumentStates.NOT_INITIALIZED);
                break;
            }
            const robot = (0, startUp_1.getRobotState)();
            if ((robot == runState_1.RobotStates.PAUSED || flowRobotState == flowStates_1.FlowRobotStates.FINISHING) && instrument == instrumentStates_1.InstrumentStates.IDLE) {
                (0, wsInstrumentFunctions_1.fromServerSendMessageToInstrument)("RUN");
                setFlowInstrumentState(flowStates_1.FlowInstrumentStates.ANALYZE_SAMPLE_DONE);
            }
            break;
        }
        case flowStates_1.FlowInstrumentStates.ANALYZE_SAMPLE_DONE: {
            const instrument = (0, startUp_1.getInstrumentState)();
            if (instrument == instrumentStates_1.InstrumentStates.IDLE) { //analyzing is done when instrument is idle
                if (getFlowRobotState() == flowStates_1.FlowRobotStates.FINISHING) { //if robot is finished then instrument is done
                    setFlowInstrumentState(flowStates_1.FlowInstrumentStates.DONE);
                    break;
                }
                setFlowRobotState(flowStates_1.FlowRobotStates.START);
                setFlowInstrumentState(flowStates_1.FlowInstrumentStates.NOT_INITIALIZED);
            }
            else if (instrument == instrumentStates_1.InstrumentStates.UNKNOWN) {
                setFlowInstrumentState(flowStates_1.FlowInstrumentStates.NOT_INITIALIZED);
            }
            break;
        }
        case flowStates_1.FlowInstrumentStates.DONE: {
            return;
        }
        default: {
            console.log("Robot State: Default");
            break;
        }
    }
};
