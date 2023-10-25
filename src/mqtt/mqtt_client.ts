import * as mqtt from "mqtt";

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
            console.error("MQTT error thrown:", err);
        });

        this.client.on("connect", () => {
            console.log("MQTT client connected");

            // connect to "send commands" and "receive" topics
            this.client.subscribe([process.env.MQTT_SENDCMD_TOPIC, process.env.MQTT_RECEIVE_TOPIC], (err, req) => {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log(`MQTT client subscribed to topics '${req.map((r) => r.topic).join("', '")}'`);
              });
        });
    }

    get connected() {
        return this.client.connected;
    }

    get disconnecting() {
        return this.client.disconnecting;
    }
}