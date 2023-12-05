import { FlowInstrumentStates, FlowRobotStates } from "../Types/flowStates";
import { InstrumentStates } from "../Types/instrumentStates";
import { RobotStates } from "../Types/runState";
import { getInstrumentState, getRobotState } from "./startUp";
import { fromServerSendMessageToInstrument } from "./wsInstrumentFunctions";
import { sendCommand } from "./RESTRobotFunctions";

/**
 * flowInstrumentState
 * @description variable describing the current flow state of the instrument
 * @type {FlowInstrumentStates}
 * @default FlowInstrumentStates.NOT_INITIALIZED
 * getFlowInstrumentState: returns the flowInstrumentState variable
 * setFlowInstrumentState: sets the flowInstrumentState variable
 */
let flowInstrumentState = FlowInstrumentStates.NOT_INITIALIZED;
const getFlowInstrumentState = () => {
    return flowInstrumentState;
}
const setFlowInstrumentState = (newState: FlowInstrumentStates) => {
  flowInstrumentState = newState;
}

/**
 * flowRobotState
 * @description variable describing the current flow state of the robot
 * @type {FlowRobotStates}
 * @default FlowRobotStates.START
 * getFlowRobotState: returns the flowRobotState variable
 * setFlowRobotState: sets the flowRobotState variable
 */
let flowRobotState = FlowRobotStates.START;
const getFlowRobotState = () => {
    return flowRobotState;
}
const setFlowRobotState = (newState: FlowRobotStates) => {
  flowRobotState = newState;
}

/**
 * shouldFlowStart
 * @returns {boolean} true if the flow control should start
 * The flow should only start if the is idle and the robot is either idle or unknown state
 */
export const shouldFlowStart = (): boolean => {
    const instrument = getInstrumentState();
    const robot = getRobotState();
    if((instrument == InstrumentStates.UNKNOWN || instrument == InstrumentStates.IDLE) && robot == RobotStates.IDLE) {
        return true;
    } else {
        return false;
    }
}

/**
 * startControlFlow
 * @description function that starts and controls the flow of the robot and instrument
 * The function is sequentially called every 2 seconds until the flow is done
 * The flow is done when the robot is in the finishing flow state and the instrument is in the done flow state
 */
export function startControlFlow() {
    setTimeout(function() {
        const flowRobot = getFlowRobotState();
        const flowInstrument = getFlowInstrumentState();
        handleRobotState(flowRobot);
        console.log("Flow robot state: ", getFlowRobotState());
        console.log("Flow instrument state: ", getFlowInstrumentState());
        if(flowInstrument != FlowInstrumentStates.DONE){
            startControlFlow();
        } else { //reset states
            setFlowInstrumentState(FlowInstrumentStates.NOT_INITIALIZED);
            setFlowRobotState(FlowRobotStates.START);
        }
    }, 2000);
    console.log("\n");
}

/**
 * handleRobotState
 * @param robotState - current flow state of the robot
 * @description function that handles the flow state of the robot
 */
const handleRobotState = (robotState: FlowRobotStates) => {
    const robot = getRobotState();
    if(robot == RobotStates.FINISHING && flowRobotState != FlowRobotStates.FINISHING) { //check if robot is finishing and only set if it is not already set
        setFlowRobotState(FlowRobotStates.FINISHING);
    }
    switch(robotState) {
        case FlowRobotStates.START: { 
            if(robot == RobotStates.PAUSED) {//this happens from run 2 and onwards as the robot stops after dropping the pipette
                sendCommand("play");
            } else if(robot == RobotStates.RUNNING) { // this happens in the first run
                setFlowRobotState(FlowRobotStates.FETCHING_SAMPLE);
                const flowInstrument = getFlowInstrumentState(); //Check if startup for instrument happens correctly
                handleInstrumentState(flowInstrument);
            }
            break;
        }
        case FlowRobotStates.FETCHING_SAMPLE: {
            if(robot == RobotStates.PAUSED){ //robot has fetched sample
                const flowInstrument = getFlowInstrumentState();
                handleInstrumentState(flowInstrument);
            }
            break;
        }
        case FlowRobotStates.DROP_SAMPLE: {
            const instrument = getInstrumentState();
            if(instrument == InstrumentStates.IDLE && flowInstrumentState == FlowInstrumentStates.READY) { //when instrument is ready, drop sample
                setFlowInstrumentState(FlowInstrumentStates.ANALYZE_SAMPLE);
                sendCommand("play");
            } else if(robot == RobotStates.PAUSED || robot == RobotStates.FINISHING) { //we must wait for the robot to be done dropping the sample before analyzing
                setFlowRobotState(FlowRobotStates.WAITING_FOR_INSTRUMENT);
                const flowInstrument = getFlowInstrumentState();
                handleInstrumentState(flowInstrument);
            }
            break;
        }
        case FlowRobotStates.WAITING_FOR_INSTRUMENT: {
            const flowInstrument = getFlowInstrumentState();
            handleInstrumentState(flowInstrument);
            break;
        }
        case FlowRobotStates.FINISHING: {
            const flowInstrument = getFlowInstrumentState();
            if(flowInstrument == FlowInstrumentStates.DONE) {
                return;
            }
            handleInstrumentState(flowInstrument);
            break;
        }
        default: {
            console.log("Instrument State: Default")
            break;
        }
    }
}

/**
 * handleInstrumentState
 * @param instrumentState - current flow state of the instrument
 * @description function that handles the flow state of the instrument
 */
const handleInstrumentState = (instrumentState: FlowInstrumentStates) => {
    switch(instrumentState) {
        case FlowInstrumentStates.NOT_INITIALIZED: {
            const flowRobot = getFlowRobotState();
            if(flowRobot == FlowRobotStates.FINISHING) { //check if robot has finished
                setFlowInstrumentState(FlowInstrumentStates.DONE);
            }
            const instrument = getInstrumentState();
            if(instrument == InstrumentStates.UNKNOWN) { //if instrument is not initialized, initialize it
                fromServerSendMessageToInstrument("INITIALIZE");
                setFlowInstrumentState(FlowInstrumentStates.INITIALIZE_CALLED);
            } else if(instrument == InstrumentStates.IDLE) { //if instrument is initialized, set instrument state to ready
                setFlowInstrumentState(FlowInstrumentStates.READY);
            }
            break;
        }
        case FlowInstrumentStates.INITIALIZE_CALLED: {
            const instrument = getInstrumentState();
            if(instrument == InstrumentStates.IDLE) { // instrument is initialized
                setFlowInstrumentState(FlowInstrumentStates.READY);
            } else { //in case instrument times out during initialization
                setFlowInstrumentState(FlowInstrumentStates.NOT_INITIALIZED);
            }
            break;
        }
        case FlowInstrumentStates.READY: {
            const flowRobot = getFlowRobotState();
            if(flowRobot == FlowRobotStates.WAITING_FOR_INSTRUMENT || flowRobot == FlowRobotStates.FINISHING) { 
                setFlowInstrumentState(FlowInstrumentStates.ANALYZE_SAMPLE);
                break;
            }
            setFlowRobotState(FlowRobotStates.DROP_SAMPLE);
            break;
        }
        case FlowInstrumentStates.ANALYZE_SAMPLE: {
            const instrument = getInstrumentState();
            if(instrument == InstrumentStates.UNKNOWN){
                setFlowInstrumentState(FlowInstrumentStates.NOT_INITIALIZED);
                break;
            }

            const robot = getRobotState();
            if((robot == RobotStates.PAUSED || flowRobotState == FlowRobotStates.FINISHING) && instrument == InstrumentStates.IDLE) {
                fromServerSendMessageToInstrument("RUN");
                setFlowInstrumentState(FlowInstrumentStates.ANALYZE_SAMPLE_DONE);
            }
            break;
        }
        case FlowInstrumentStates.ANALYZE_SAMPLE_DONE: {
            const instrument = getInstrumentState();
            if(instrument == InstrumentStates.IDLE ) { //analyzing is done when instrument is idle
                if(getFlowRobotState() == FlowRobotStates.FINISHING) { //if robot is finished then instrument is done
                    setFlowInstrumentState(FlowInstrumentStates.DONE);
                    break;
                }
                setFlowRobotState(FlowRobotStates.START);
                setFlowInstrumentState(FlowInstrumentStates.NOT_INITIALIZED);
            } else if(instrument == InstrumentStates.UNKNOWN) {
                setFlowInstrumentState(FlowInstrumentStates.NOT_INITIALIZED);
            } 
            break;
        }
        case FlowInstrumentStates.DONE: {
            return;
        }
        default: {
            console.log("Robot State: Default");
            break;
        }
    }
}