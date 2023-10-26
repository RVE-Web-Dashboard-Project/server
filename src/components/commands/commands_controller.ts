import { Request, Response } from "express";

import { COMMANDS_LIST } from "../../commands/commands_list";
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

export async function getCommandsList(req: Request, res: Response) {
    return res.status(200).send({
        success: true,
        data: COMMANDS_LIST,
    });
}