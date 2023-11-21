/**
 * FlowRobotStates
 * @description Enum for the states of the robot during control flow
 */
export enum FlowRobotStates {
    START = 'START',
    FETCHING_SAMPLE = 'FETCHING_SAMPLE',
    DROP_SAMPLE = 'DROP_SAMPLE',
    WAITING_FOR_INSTRUMENT = 'WAITING_FOR_INSTRUMENT',
    FINISHING = 'FINISHING',
}

/**
 * FlowInstrumentStates
 * @description Enum for the states of the instrument during control flow
 */
export enum FlowInstrumentStates {
    NOT_INITIALIZED = 'NOT_INITIALIZED',
    INITIALIZE_CALLED = 'INITIALIZE_CALLED',
    READY = 'READY',
    ANALYZE_SAMPLE = 'ANALYZE_SAMPLE',
    ANALYZE_SAMPLE_DONE = 'ANALYZE_SAMPLE_DONE',
    DONE = 'DONE',
}