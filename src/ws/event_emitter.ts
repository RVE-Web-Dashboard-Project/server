import { EventEmitter } from "stream";

import { MQTTConnectionStatus } from "../mqtt/mqtt_types";

interface MyEventEmitter {
    emit(event: "mqtt_connection_update", status: MQTTConnectionStatus): boolean;
    emit(event: "test_body", json: object): boolean;

    on(event: "mqtt_connection_update", listener: (status: MQTTConnectionStatus) => void): this;
    on(event: "test_body", listener: (json: object) => void): this;
}

export const eventEmitter: MyEventEmitter = new EventEmitter();
