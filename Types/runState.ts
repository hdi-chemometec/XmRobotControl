/**
 * RobotStates
 * @description Enum for the different states a robot can be in.
 */

export enum RobotStates {
    IDLE = "idle",
    RUNNING = "running",
    PAUSED = "paused",
    STOPPED = "stopped",
    STOP_REQUESTED = "stop requested",
    SUCCEEDED = "succeeded",
    FINISHING = "finishing",
    UNKNOWN = "unknown"
}