import { EventEmitter } from "stream";

import { MQTTConnectionStatus } from "../mqtt/mqtt_client";

interface MyEventEmitter {
    emit(event: "mqtt_connection_update", status: MQTTConnectionStatus): boolean;

    on(event: "mqtt_connection_update", listener: (status: MQTTConnectionStatus) => void): this;
}

export const eventEmitter: MyEventEmitter = new EventEmitter();
