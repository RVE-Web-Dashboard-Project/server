import * as mqtt from "mqtt";
import { is } from "typia";

import { Command } from "../types";
import { eventEmitter } from "../ws/event_emitter";
import { MQTTConnectionStatus, MQTTReceivedMessage } from "./mqtt_types";

export default class MQTTClient {
    private static instance: MQTTClient;

    private client: mqtt.MqttClient;

    private currentStatus = MQTTConnectionStatus.Disconnected;

    public static getInstance(): MQTTClient {
        if (!MQTTClient.instance) {
            MQTTClient.instance = new MQTTClient();
        }
        return MQTTClient.instance;
    }

    private constructor() {
        const protocol = "mqtts";
        const host = process.env.MQTT_BROKER_URL;
        const port = process.env.MQTT_BROKER_TLS_PORT;
        const clientId = process.env.MQTT_CLIENT_ID;

        const connectUrl = `${protocol}://${host}:${port}`;

        this.client = mqtt.connect(connectUrl, {
            clientId,
            clean: false, // persistent session
            connectTimeout: 4000,
            username: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASSWORD,
            reconnectPeriod: 1000,
        });

        this.client.on("error", (err) => {
            console.error("MQTT connection error thrown:", err);
        });

        this.client.on("connect", () => {
            console.log("MQTT client connected");

            // connect to "send commands" and "receive" topics
            this.client.subscribe([process.env.MQTT_RECEIVE_TOPIC], (err, req) => {
                if (err) {
                    console.error("MQTT subscription failed:", err);
                    return;
                }
                console.log(`MQTT client subscribed to topics '${req.map((r) => r.topic).join("', '")}'`);
              });
        });

        this.client.on("message", this.handleMessage.bind(this));

        // refresh connection status every 5 seconds
        setInterval(this.refreshStatusAndEmits.bind(this), 5000);
    }

    private async handleMessage(topic: string, payload: Buffer) {
        let data;
        try {
            data = JSON.parse(payload.toString());
        } catch (e) {
            console.error("MQTT received malformed message:", payload.toString());
            return;
        }
        if (!is<MQTTReceivedMessage>(data)) {
            console.error("MQTT received malformed message:", payload.toString());
            return;
        }
        console.log("MQTT received on topic", topic, "the message:", payload.toString());
        eventEmitter.emit("mqtt_response_received", data);

    }

    private async publish(topic: string, message: string) {
        console.debug("MQTT sending on topic", topic, "the message:", message);
        return await this.client.publishAsync(topic, message);
    }

    get connected() {
        return this.client.connected;
    }

    get disconnecting() {
        return this.client.disconnecting;
    }

    get connectionStatus() {
        if (this.client.disconnecting) {
            return MQTTConnectionStatus.Disconnecting;
        }
        if (this.client.connected) {
            return MQTTConnectionStatus.Connected;
        }
        return MQTTConnectionStatus.Disconnected;
    }

    private refreshStatusAndEmits() {
        const status = this.connectionStatus;
        if (status !== this.currentStatus) {
            this.currentStatus = status;
            console.log("MQTT connection status changed to", status);
            eventEmitter.emit("mqtt_connection_update", status);
        }
    }

    async sendCommand(commandId: Command["id"], buildingId: number, coordinatorId: number, nodeId: number, parameters: number[]) {
        const data = {
            "command": commandId,
            "building_id": buildingId,
            "coord_id": coordinatorId,
            "node_id": nodeId,
            "params": {
                "param1": parameters[0] ?? 0,
                "param2": parameters[1] ?? 0,
                "param3": parameters[2] ?? 0,
                "param4": parameters[3] ?? 0,
            },
        };
        await this.publish(process.env.MQTT_SENDCMD_TOPIC, JSON.stringify(data));
    }
}
