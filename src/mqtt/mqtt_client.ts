import * as mqtt from "mqtt";

import { Command } from "../types";

export default class MQTTClient {
    private static instance: MQTTClient;

    private client: mqtt.MqttClient;

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
        console.log("connectUrl", connectUrl);

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
    }

    private async handleMessage(topic: string, payload: Buffer) {
        console.log("MQTT received message:", topic, payload.toString());
    }

    private async publish(topic: string, message: string) {
        return await this.client.publishAsync(topic, message);
    }

    get connected() {
        return this.client.connected;
    }

    get disconnecting() {
        return this.client.disconnecting;
    }

    async sendCommand(commandId: Command["id"], buildingId: number, coordinatorId: number, nodeId: number, parameters: number[]) {
        const data = {
            "command": commandId,
            "building_id": buildingId,
            "coord_id": coordinatorId,
            "node_id": nodeId,
            "params": parameters,
        };
        const res = await this.publish(process.env.MQTT_SENDCMD_TOPIC, JSON.stringify(data));
        console.debug("received data", res);
    }
}