import { Request, Response } from "express";

import MQTTClient from "../../mqtt/mqtt_client";

const mqttClient = MQTTClient.getInstance();

export async function getBrokerConnectionStatus(req: Request, res: Response) {
    if (mqttClient.connected) {
        return res.status(200).send({ success: true, data: "connected" });
    }
    if (mqttClient.disconnecting) {
        return res.status(200).send({ success: true, data: "disconnecting" });
    }
    return res.status(200).send({ success: true, data: "disconnected" });
}