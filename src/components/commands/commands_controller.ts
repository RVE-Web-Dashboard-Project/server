import { Request, Response } from "express";
import { is } from "typia";

import { COMMANDS_LIST } from "../../commands/commands_list";
import Database from "../../database";
import MQTTClient from "../../mqtt/mqtt_client";

const db = Database.getInstance();
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

export async function sendCommand(req: Request<unknown, unknown, SendCommandParams>, res: Response) {
     // check arguments existense
     if (!is<SendCommandParams>(req.body)) {
        res._err = "Missing or invalid arguments";
        return res.status(400).send({ success: false, message: res._err });
    }

    // check command ID existence
    const command = COMMANDS_LIST.find((c) => c.id === req.body.commandId);
    if (!command) {
        res._err = "Command not found";
        return res.status(404).send({ success: false, error: res._err });
    }

    if (command.targetType === "node") {
        // check node ID existence
        if (!req.body.nodeId) {
            res._err = "Node ID is required";
            return res.status(400).send({ success: false, error: res._err });
        }

        // check if node ID is present in the coordinator
        const coordinatorNodes = await db.coordinatorNode.findMany({
            where: {
                coordinatorId: req.body.coordinatorId,
            },
        });
        const nodeIds = coordinatorNodes.map((cn) => cn.id);
        if (!nodeIds.includes(req.body.nodeId)) {
            res._err = "No node found with this ID in this coordinator";
            return res.status(400).send({ success: false, error: res._err });
        }
    }

    // check parameters count
    if (command.parameters.length !== (req.body.parameters?.length ?? 0)) {
        res._err = "Parameters count mismatch";
        return res.status(400).send({ success: false, error: res._err });
    }

    // check parameters values
    const parameters = req.body.parameters ?? [];
    for (let i = 0; i < command.parameters.length; i++) {
        const param = command.parameters[i];
        const value = parameters[i];
        if ((param.minValue && value < param.minValue) || (param.maxValue && value > param.maxValue)) {
            res._err = `Parameter ${param.name} value out of range`;
            return res.status(400).send({ success: false, error: res._err });
        }
        if (param.type === "int" && !Number.isInteger(value)) {
            res._err = `Parameter ${param.name} value is not an integer`;
            return res.status(400).send({ success: false, error: res._err });
        }
    }

    // TODO: find building ID
    const buildingId = 1;

    // check MQTT broker connection
    if (!mqttClient.connected) {
        res._err = "MQTT broker not connected";
        return res.status(500).send({ success: false, error: res._err });
    }

    // send command
    try {
        await mqttClient.sendCommand(command.id, buildingId, req.body.coordinatorId, req.body.nodeId ?? 0, parameters);
    } catch (err) {
        console.error("Failed to send command:", err);
        res._err = "Failed to send command";
        return res.status(500).send({ success: false, error: res._err });
    }

    return res.status(200).send({ success: true });
}
