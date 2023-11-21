/**
 * InstrumentStates
 * @description Enum for the different states of an instrument
 */
export enum InstrumentStates {
    IDLE = 'IDLE',
    BUSY = 'BUSY',
    INTRANSITION = 'INTRANSITION',
    UNKNOWN = 'UNKNOWN',
    NO_STATE = 'NO_STATE',
    ERROR = 'ERROR'
}