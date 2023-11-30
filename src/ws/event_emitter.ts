import { EventEmitter } from "stream";

import { MQTTConnectionStatus, MQTTReceivedMessage } from "../mqtt/mqtt_types";

interface MyEventEmitter {
    emit(event: "mqtt_connection_update", status: MQTTConnectionStatus): boolean;
    emit(event: "mqtt_response_received", data: MQTTReceivedMessage): boolean;
    emit(event: "test_body", json: object): boolean;

    on(event: "mqtt_connection_update", listener: (status: MQTTConnectionStatus) => void): this;
    on(event: "mqtt_response_received", listener: (data: MQTTReceivedMessage) => void): this;
    on(event: "test_body", listener: (json: object) => void): this;
}

export const eventEmitter: MyEventEmitter = new EventEmitter();
