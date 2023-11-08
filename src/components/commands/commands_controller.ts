import { Request, Response } from "express";
import { is } from "typia";

import { COMMANDS_LIST } from "../../commands/commands_list";
import Database from "../../database";
import MQTTClient from "../../mqtt/mqtt_client";
import { eventEmitter } from "../../ws/event_emitter";

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

    // check nodes parameter
    const coordinatorToNodesMap = new Map<number, number[]>();
    if (command.targetType === "node") {
        // check node IDs existence
        if (req.body.nodeIds === undefined || req.body.nodeIds.length === 0) {
            res._err = "Node ID is required";
            return res.status(400).send({ success: false, error: res._err });
        }

        // check if each node ID is present in at least one coordinator
        const coordinatorNodes = await db.coordinatorNode.findMany({
            where: {
                coordinator: {
                    id: {
                        in: req.body.coordinatorIds,
                    },
                },
            },
        });
        for (const nodeId of req.body.nodeIds) {
            const correspondingCoordinatorId = coordinatorNodes.filter((cn) => cn.id === nodeId).map((cn) => cn.coordinatorId)[0];
            if (!correspondingCoordinatorId) {
                res._err = `Node ${nodeId} not found`;
                return res.status(404).send({ success: false, error: res._err });
            }
            coordinatorToNodesMap.set(
                correspondingCoordinatorId, [...(coordinatorToNodesMap.get(correspondingCoordinatorId) ?? []), nodeId]
            );
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
        for (const coordinatorId of req.body.coordinatorIds) {
            if (command.targetType === "coordinator") {
                // does not need a node ID
                await mqttClient.sendCommand(command.id, buildingId, coordinatorId, 0, parameters);
            } else {
                for (const nodeId of coordinatorToNodesMap.get(coordinatorId) ?? []) {
                    await mqttClient.sendCommand(command.id, buildingId, coordinatorId, nodeId, parameters);
                }
            }
        }
    } catch (err) {
        console.error("Failed to send command:", err);
        res._err = "Failed to send command";
        return res.status(500).send({ success: false, error: res._err });
    }

    eventEmitter.emit("command_usage", command.id);
    return res.status(200).send({ success: true });
}
