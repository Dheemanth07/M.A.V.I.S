import EventEmitter from "events";

// Create a single, global event emitter instance
const mavisEvents = new EventEmitter();

// Define your event names as constants to prevent typos
export const EVENTS = {
    SENSOR_DATA_RECEIVED: "SENSOR_DATA_RECEIVED"
};

export default mavisEvents;